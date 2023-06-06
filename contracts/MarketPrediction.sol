// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MarketPrediction is AccessControl {
    /**variable*/
    using Counters for Counters.Counter;
    Counters.Counter private _voteId;

    string private _voteUrl;
    string private _dataUrl;

    mapping(uint256 => bytes) private _ipfsHash;
    mapping(uint256 => address) private _ownersVote;
    mapping(uint256 => address) private _ownersData;

    mapping(uint256 => mapping(address => bool)) hasVoted;
    mapping(uint256 => mapping(address => bytes)) voteData;

    event CreateVote(address indexed from, uint256 indexed voteId);
    event SubmitVote(address indexed to, uint256 indexed voteId);

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    string private constant MSG_PREFIX = "\x19Ethereum Signed Message:\n32";

    mapping(address => bool) private _isValidSigner;
    uint private _threshold = 1;
    uint256 public nonce;
    bool private _lock;

    /**constructor */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /**function */
    function createVote(bytes memory ipfsHash) public {
        require(msg.sender != address(0), "Invalid sender address.");
        _voteId.increment();
        uint256 _voteIdCurrent = _voteId.current();
        _ipfsHash[_voteIdCurrent] = ipfsHash;
        _ownersVote[_voteIdCurrent] = msg.sender;
        emit CreateVote(msg.sender, _voteIdCurrent);
    }

    function submitVote(
        uint256 _submitVoteId,
        bytes memory ipfsHash,
        uint256 _nonce,
        bytes[] calldata _multiSignature
    ) external nonReentrant {
        require(
            _ipfsHash[_submitVoteId].length > 0,
            "IPFS hash not found for the given vote ID."
        );
        require(msg.sender != address(0), "Invalid sender address.");
        require(
            !hasVoted[_submitVoteId][msg.sender],
            "This address has already voted for this vote ID."
        );
        _verifyMultiSignature(ipfsHash, _nonce, _multiSignature);
        voteData[_submitVoteId][msg.sender] = ipfsHash;
        hasVoted[_submitVoteId][msg.sender] = true;
        emit SubmitVote(msg.sender, _submitVoteId);
    }

    function getCreateVoted(uint256 id) public view returns (bytes memory) {
        return _ipfsHash[id];
    }

    function getsubmitVoted(
        uint256 id,
        address from
    ) public view returns (bytes memory) {
        return voteData[id][from];
    }

    function _processWithdrawalInfo(
        bytes memory ipfsHash,
        uint256 _nonce
    ) private pure returns (bytes32 _digest) {
        _digest = keccak256(abi.encodePacked(ipfsHash, _nonce));
        _digest = keccak256(abi.encodePacked(MSG_PREFIX, _digest));
        return _digest;
    }

    function _verifyMultiSignature(
        bytes memory ipfsHash,
        uint256 _nonce,
        bytes[] calldata _multiSignature
    ) private {
        _isValidSigner[msg.sender] = true;
        require(_nonce > nonce, "nonce already used");
        uint256 count = _multiSignature.length;
        require(count >= _threshold, "not enough signers");
        bytes32 digest = _processWithdrawalInfo(ipfsHash, _nonce);
        // address initSignerAddress;
        for (uint256 i = 0; i < count; i++) {
            bytes memory signature = _multiSignature[i];
            address signerAddress = ECDSA.recover(digest, signature);
            // require(signerAddress > initSignerAddress, "possible duplicate");
            require(_isValidSigner[signerAddress], "not part of consortium");
            // initSignerAddress = signerAddress;
        }
        nonce = _nonce;
    }

    function addAdmin(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, account);
        _isValidSigner[account] = true;
    }

    function removeAdmin(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, account);
        _isValidSigner[account] = false;
    }

    modifier nonReentrant() {
        require(!_lock);
        _lock = true;
        _;
        _lock = false;
    }
}
