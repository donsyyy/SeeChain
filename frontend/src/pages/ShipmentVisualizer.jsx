import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import { ethers } from 'ethers';
import SeeChainShipments from '../abi/SeeChainShipments.json';

const ShipmentVisualizer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShipmentData() {
      setLoading(true);
      setError(null);
      try {
        if (!window.ethereum) throw new Error('Wallet not connected');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          SeeChainShipments.abi,
          provider
        );
        const shipmentIdBytes = ethers.id(id);
        // Fetch shipment struct
        const s = await contract.shipments(shipmentIdBytes);
        // Fetch logs
        const logsOnChain = await contract.getShipmentLogs(shipmentIdBytes);
        setLogs(logsOnChain.map(log => ({
          timestamp: new Date(Number(log.timestamp) * 1000).toLocaleString(),
          status: log.status,
          updater: log.updater
        })));
        setShipment({
          id: s.idString,
          origin: s.origin,
          destination: s.destination,
          status: logsOnChain.length > 0 ? logsOnChain[logsOnChain.length - 1].status : '',
          lastUpdate: logsOnChain.length > 0 ? new Date(Number(logsOnChain[logsOnChain.length - 1].timestamp) * 1000).toLocaleString() : ''
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch shipment');
      }
      setLoading(false);
    }
    fetchShipmentData();
  }, [id]);

  if (!shipment) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Shipment Not Found</h1>
          <button className="edit-status-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Shipment {shipment.id}</h1>
        <p>Origin: <b>{shipment.origin}</b> &nbsp; | &nbsp; Destination: <b>{shipment.destination}</b></p>
        <p>Status: <b>{shipment.status}</b> &nbsp; | &nbsp; Last Update: <b>{shipment.lastUpdate}</b></p>
        <button className="edit-status-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
      <section className="shipments-section">
        <h2>Status Log</h2>
        {loading ? (
          <div>Loading logs...</div>
        ) : error ? (
          <div style={{ color: '#d32f2f' }}>{error}</div>
        ) : (
          <table className="shipments-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Updater</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((log, idx) => (
                <tr key={idx}>
                  <td>{log.timestamp}</td>
                  <td>{log.status}</td>
                  <td>{log.updater}</td>
                </tr>
              )) : (
                <tr><td colSpan="3">No logs found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ShipmentVisualizer; 