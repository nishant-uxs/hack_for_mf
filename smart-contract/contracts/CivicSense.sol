// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CivicSense is Ownable {
    enum ComplaintStatus {
        Reported,
        Verified,
        InProgress,
        Resolved
    }

    struct Complaint {
        string complaintHash;
        uint256 timestamp;
        ComplaintStatus status;
        address reporter;
        bool exists;
    }

    struct StatusUpdate {
        ComplaintStatus status;
        uint256 timestamp;
        string resolutionHash;
    }

    mapping(string => Complaint) public complaints;
    mapping(string => StatusUpdate[]) public statusHistory;
    
    string[] public complaintIds;

    event ComplaintRegistered(
        string indexed complaintId,
        string complaintHash,
        address indexed reporter,
        uint256 timestamp
    );

    event ComplaintStatusUpdated(
        string indexed complaintId,
        ComplaintStatus status,
        uint256 timestamp
    );

    event ComplaintResolved(
        string indexed complaintId,
        string resolutionHash,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    function registerComplaint(
        string memory _complaintId,
        string memory _complaintHash
    ) external {
        require(!complaints[_complaintId].exists, "Complaint already exists");
        require(bytes(_complaintHash).length > 0, "Hash cannot be empty");

        complaints[_complaintId] = Complaint({
            complaintHash: _complaintHash,
            timestamp: block.timestamp,
            status: ComplaintStatus.Reported,
            reporter: msg.sender,
            exists: true
        });

        statusHistory[_complaintId].push(StatusUpdate({
            status: ComplaintStatus.Reported,
            timestamp: block.timestamp,
            resolutionHash: ""
        }));

        complaintIds.push(_complaintId);

        emit ComplaintRegistered(
            _complaintId,
            _complaintHash,
            msg.sender,
            block.timestamp
        );
    }

    function updateComplaintStatus(
        string memory _complaintId,
        ComplaintStatus _status
    ) external onlyOwner {
        require(complaints[_complaintId].exists, "Complaint does not exist");
        require(_status != ComplaintStatus.Reported, "Cannot revert to Reported");

        complaints[_complaintId].status = _status;

        statusHistory[_complaintId].push(StatusUpdate({
            status: _status,
            timestamp: block.timestamp,
            resolutionHash: ""
        }));

        emit ComplaintStatusUpdated(_complaintId, _status, block.timestamp);
    }

    function resolveComplaint(
        string memory _complaintId,
        string memory _resolutionHash
    ) external onlyOwner {
        require(complaints[_complaintId].exists, "Complaint does not exist");
        require(bytes(_resolutionHash).length > 0, "Resolution hash required");

        complaints[_complaintId].status = ComplaintStatus.Resolved;

        statusHistory[_complaintId].push(StatusUpdate({
            status: ComplaintStatus.Resolved,
            timestamp: block.timestamp,
            resolutionHash: _resolutionHash
        }));

        emit ComplaintResolved(_complaintId, _resolutionHash, block.timestamp);
    }

    function verifyComplaint(
        string memory _complaintId,
        string memory _complaintHash
    ) external view returns (bool) {
        require(complaints[_complaintId].exists, "Complaint does not exist");
        return keccak256(bytes(complaints[_complaintId].complaintHash)) == 
               keccak256(bytes(_complaintHash));
    }

    function getComplaint(string memory _complaintId)
        external
        view
        returns (
            string memory complaintHash,
            uint256 timestamp,
            ComplaintStatus status,
            address reporter
        )
    {
        require(complaints[_complaintId].exists, "Complaint does not exist");
        Complaint memory c = complaints[_complaintId];
        return (c.complaintHash, c.timestamp, c.status, c.reporter);
    }

    function getStatusHistory(string memory _complaintId)
        external
        view
        returns (StatusUpdate[] memory)
    {
        require(complaints[_complaintId].exists, "Complaint does not exist");
        return statusHistory[_complaintId];
    }

    function getTotalComplaints() external view returns (uint256) {
        return complaintIds.length;
    }

    function getComplaintIdByIndex(uint256 _index)
        external
        view
        returns (string memory)
    {
        require(_index < complaintIds.length, "Index out of bounds");
        return complaintIds[_index];
    }

    function complaintExists(string memory _complaintId)
        external
        view
        returns (bool)
    {
        return complaints[_complaintId].exists;
    }
}
