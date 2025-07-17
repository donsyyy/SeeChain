import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import { ethers } from 'ethers';
import SeeChainShipments from '../abi/SeeChainShipments.json';

const mockShipments = [
  { id: 'SHP001', status: 'In Transit', origin: 'Shanghai', destination: 'Los Angeles', lastUpdate: '2024-06-01 10:00', logs: [{ timestamp: '2024-06-01 10:00', status: 'Created', updater: '0x123...' }] },
  { id: 'SHP002', status: 'Delivered', origin: 'Rotterdam', destination: 'New York', lastUpdate: '2024-06-02 15:30', logs: [{ timestamp: '2024-06-02 15:30', status: 'Delivered', updater: '0x456...' }] },
  { id: 'SHP003', status: 'Pending', origin: 'Singapore', destination: 'Hamburg', lastUpdate: '2024-06-03 08:45', logs: [{ timestamp: '2024-06-03 08:45', status: 'Pending', updater: '0x789...' }] },
];

const SEECHAIN_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const SEECHAIN_ABI = [
  // Only the createShipment ABI is needed for now
  {
    "inputs": [
      { "internalType": "bytes32", "name": "shipmentId", "type": "bytes32" },
      { "internalType": "string", "name": "origin", "type": "string" },
      { "internalType": "string", "name": "destination", "type": "string" }
    ],
    "name": "createShipment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const DashboardPage = () => {
  const [account, setAccount] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isCustoms, setIsCustoms] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newShipment, setNewShipment] = useState({ id: '', origin: '', destination: '' });
  const [createStatus, setCreateStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAccountAndShipments() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts[0]) {
            setAccount(accounts[0]);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
              SEECHAIN_CONTRACT_ADDRESS,
              SeeChainShipments.abi,
              provider
            );
            // Fetch all shipments from the blockchain
            const shipmentsOnChain = await contract.getAllShipments();
            const shipmentData = shipmentsOnChain.map(s => {
              const logsFormatted = (s.logs || []).map(log => ({
                timestamp: new Date(Number(log.timestamp) * 1000).toLocaleString(),
                status: log.status,
                updater: log.updater
              }));
              const lastLog = logsFormatted[logsFormatted.length - 1] || {};
              return {
                id: s.idString,
                status: lastLog.status || '',
                origin: s.origin,
                destination: s.destination,
                lastUpdate: lastLog.timestamp || '',
                logs: logsFormatted
              };
            });
            setShipments(shipmentData);
            const isCustomsOnChain = await contract.isCustoms(accounts[0]);
            setIsCustoms(isCustomsOnChain);
          } else {
            navigate('/signin');
          }
        } catch {
          navigate('/signin');
        }
      } else {
        navigate('/signin');
      }
    }
    fetchAccountAndShipments();
  }, [navigate]);

  const handleLogout = () => {
    setAccount(null);
    navigate('/signin');
  };

  const handleRowClick = (shipmentId) => {
    window.open(`/shipment/${shipmentId}`, '_blank');
  };

  const handleEditClick = (shipmentId) => {
    setEditingId(shipmentId);
    setNewStatus('');
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleStatusSubmit = async (shipmentId) => {
    setEditingId(null);
    setNewStatus('');
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          SEECHAIN_CONTRACT_ADDRESS,
          SeeChainShipments.abi,
          signer
        );
        const shipmentIdBytes = ethers.id(shipmentId);
        const tx = await contract.updateShipmentStatus(shipmentIdBytes, newStatus);
        await tx.wait(); // Wait for transaction to be mined

        // Refetch shipments from blockchain
        const shipmentsOnChain = await contract.getAllShipments();
        const shipmentData = shipmentsOnChain.map(s => {
          const logsFormatted = (s.logs || []).map(log => ({
            timestamp: new Date(Number(log.timestamp) * 1000).toLocaleString(),
            status: log.status,
            updater: log.updater
          }));
          const lastLog = logsFormatted[logsFormatted.length - 1] || {};
          return {
            id: s.idString,
            status: lastLog.status || '',
            origin: s.origin,
            destination: s.destination,
            lastUpdate: lastLog.timestamp || '',
            logs: logsFormatted
          };
        });
        setShipments(shipmentData);
      } catch (err) {
        alert('Failed to update status: ' + (err.reason || err.message));
      }
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setCreateStatus('');
    if (!newShipment.id || !newShipment.origin || !newShipment.destination) {
      setCreateStatus('Please fill in all fields.');
      return;
    }
    try {
      if (!window.ethereum) throw new Error('Wallet not connected');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(SEECHAIN_CONTRACT_ADDRESS, SeeChainShipments.abi, signer);
      const shipmentIdBytes = ethers.id(newShipment.id); // keccak256 hash for bytes32
      const tx = await contract.createShipment(shipmentIdBytes, newShipment.origin, newShipment.destination, newShipment.id);
      await tx.wait();
      setCreateStatus('Shipment created successfully!');
      setNewShipment({ id: '', origin: '', destination: '' });
      setShowCreateForm(false);
      // Refetch shipments after creation
      const shipmentsOnChain = await contract.getAllShipments();
      const shipmentData = shipmentsOnChain.map(s => {
        const logsFormatted = (s.logs || []).map(log => ({
          timestamp: new Date(Number(log.timestamp) * 1000).toLocaleString(),
          status: log.status,
          updater: log.updater
        }));
        const lastLog = logsFormatted[logsFormatted.length - 1] || {};
        return {
          id: s.idString,
          status: lastLog.status || '',
          origin: s.origin,
          destination: s.destination,
          lastUpdate: lastLog.timestamp || '',
          logs: logsFormatted
        };
      });
      setShipments(shipmentData);
    } catch (err) {
      setCreateStatus('Error: ' + (err.reason || err.message));
    }
  };

  return (
    <div className="dashboard-container">
      {/* User Auth Bar */}
      <div className="dashboard-userbar">
        <span className="user-icon" title="Authenticated user" role="img" aria-label="user">👤</span>
        <span className="user-address">
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
        </span>
        <button className="logout-button" onClick={handleLogout} title="Log out">Log Out</button>
      </div>
      <header className="dashboard-header">
        <h1>SeeChain Dashboard</h1>
        <p>Track and manage your shipments in real time, powered by blockchain.</p>
      </header>
      <section className="shipments-section">
        <h2>Global Shipments</h2>
        <p className="shipments-description">All shipments registered on SeeChain are visible here, ensuring transparency and tamper-proof tracking for everyone worldwide.</p>
        <button className="edit-status-btn" style={{ marginBottom: 18 }} onClick={() => setShowCreateForm(f => !f)}>
          {showCreateForm ? 'Cancel' : 'Create Shipment'}
        </button>
        {showCreateForm && (
          <form className="create-shipment-form" onSubmit={handleCreateShipment} style={{ marginBottom: 24, background: '#f1f8e9', padding: 18, borderRadius: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Shipment ID"
                value={newShipment.id}
                onChange={e => setNewShipment(s => ({ ...s, id: e.target.value }))}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #bdbdbd' }}
              />
              <input
                type="text"
                placeholder="Origin"
                value={newShipment.origin}
                onChange={e => setNewShipment(s => ({ ...s, origin: e.target.value }))}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #bdbdbd' }}
              />
              <input
                type="text"
                placeholder="Destination"
                value={newShipment.destination}
                onChange={e => setNewShipment(s => ({ ...s, destination: e.target.value }))}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #bdbdbd' }}
              />
            </div>
            <button className="edit-status-btn" type="submit" style={{ minWidth: 120 }}>Submit</button>
            {createStatus && <div style={{ marginTop: 10, color: createStatus.startsWith('Error') ? '#d32f2f' : '#388e3c' }}>{createStatus}</div>}
          </form>
        )}
        <table className="shipments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Last Update</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(shipment => (
              <tr key={shipment.id} className="shipment-row" style={{ cursor: 'pointer' }} onClick={e => { if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') handleRowClick(shipment.id); }}>
                <td>{shipment.id}</td>
                <td>{shipment.status}</td>
                <td>{shipment.origin}</td>
                <td>{shipment.destination}</td>
                <td>{shipment.lastUpdate}</td>
                <td>
                  {editingId === shipment.id ? (
                    <>
                      <input
                        type="text"
                        value={newStatus}
                        onChange={handleStatusChange}
                        placeholder="New status"
                        className="edit-status-input"
                        autoFocus
                        onClick={e => e.stopPropagation()}
                      />
                      <button className="edit-status-btn" onClick={e => { e.stopPropagation(); handleStatusSubmit(shipment.id); }}>Save</button>
                      <button className="edit-status-cancel" onClick={e => { e.stopPropagation(); setEditingId(null); }}>Cancel</button>
                    </>
                  ) : (
                    <button className="edit-status-btn" onClick={e => { e.stopPropagation(); handleEditClick(shipment.id); }}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} SeeChain. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DashboardPage; 