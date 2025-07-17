// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SeeChainShipments {
    address public owner;

    struct LogEntry {
        uint256 timestamp;
        string status;
        address updater;
    }

    struct Shipment {
        string idString;
        string origin;
        string destination;
        address creator;
        LogEntry[] logs;
    }

    mapping(bytes32 => Shipment) public shipments;
    bytes32[] public allShipmentIds;
    mapping(address => bool) public isCustomsWorker;

    event CustomsWorkerAdded(address indexed worker);
    event CustomsWorkerRemoved(address indexed worker);
    event ShipmentCreated(bytes32 indexed shipmentId, address indexed creator);
    event StatusUpdated(bytes32 indexed shipmentId, string status, address indexed updater);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyCustomsWorker() {
        require(isCustomsWorker[msg.sender], "Not a customs worker");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCustomsWorker(address worker) external onlyOwner {
        isCustomsWorker[worker] = true;
        emit CustomsWorkerAdded(worker);
    }

    function removeCustomsWorker(address worker) external onlyOwner {
        isCustomsWorker[worker] = false;
        emit CustomsWorkerRemoved(worker);
    }

    function createShipment(bytes32 shipmentId, string calldata origin, string calldata destination, string calldata idString) external {
        require(shipments[shipmentId].creator == address(0), "Shipment already exists");
        shipments[shipmentId].idString = idString;
        shipments[shipmentId].origin = origin;
        shipments[shipmentId].destination = destination;
        shipments[shipmentId].creator = msg.sender;
        shipments[shipmentId].logs.push(LogEntry(block.timestamp, "Created", msg.sender));
        allShipmentIds.push(shipmentId);
        emit ShipmentCreated(shipmentId, msg.sender);
    }

    function updateShipmentStatus(bytes32 shipmentId, string calldata newStatus) external onlyCustomsWorker {
        require(shipments[shipmentId].creator != address(0), "Shipment does not exist");
        shipments[shipmentId].logs.push(LogEntry(block.timestamp, newStatus, msg.sender));
        emit StatusUpdated(shipmentId, newStatus, msg.sender);
    }

    function getShipmentLogs(bytes32 shipmentId) external view returns (LogEntry[] memory) {
        return shipments[shipmentId].logs;
    }

    function getAllShipmentIds() external view returns (bytes32[] memory) {
        return allShipmentIds;
    }

    function getAllShipments() external view returns (
        Shipment[] memory
    ) {
        Shipment[] memory result = new Shipment[](allShipmentIds.length);
        for (uint i = 0; i < allShipmentIds.length; i++) {
            result[i] = shipments[allShipmentIds[i]];
        }
        return result;
    }

    function isCustoms(address user) external view returns (bool) {
        return isCustomsWorker[user];
    }
}
