// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract VotePollV1 is AccessControlUpgradeable, PausableUpgradeable {
    using Counters for Counters.Counter;

    event CreateVotePoll(
        uint256 indexed voteId,
        address indexed creator,
        bytes32 ipfs
    );
    event CreateVote(
        uint256 indexed voteId,
        address indexed voter,
        bytes32 ipfs
    );

    // index
    Counters.Counter private id;

    struct VotePoll {
        bytes32 ipfs;
        address owner;
    }

    // vote id -> format
    mapping(uint256 => VotePoll) private forms;

    // vote id -> datas
    mapping(uint256 => mapping(address => bytes32)) data;

    // roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    // signers
    string private constant MSG_PREFIX = "\x19Ethereum Signed Message:\n32";
    mapping(address => bool) private signers;

    function initialize() public initializer {
        __Context_init_unchained();

        __AccessControl_init_unchained();
        __Pausable_init_unchained();

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());

        _pause();
    }

    function addSigner(address account) public onlyRole(ADMIN_ROLE) {
        signers[account] = true;
    }

    function removeSigner(address account) public onlyRole(ADMIN_ROLE) {
        delete signers[account];
    }

    /**
     * @dev function to pause claim
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev function to unpause claim
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function nextId() public view returns (uint256) {
        return id.current();
    }

    /**
     * @dev function to create vote poll
     * @param ipfs hash from ipfs
     */
    function createVotePoll(
        bytes32 ipfs
    ) public onlyNonContract whenNotPaused returns (uint256) {
        address creator = _msgSender();

        uint256 currentId = id.current();
        id.increment();

        forms[currentId] = VotePoll({ipfs: ipfs, owner: creator});

        emit CreateVotePoll(currentId, creator, ipfs);

        return currentId;
    }

    /**
     * @dev function to get detail of vote poll
     * @param _voteId id of vote poll
     */
    function getVotePoll(
        uint256 _voteId
    )
        public
        view
        voteRequired(_voteId)
        returns (uint256 voteId, address owner, bytes32 ipfsHash)
    {
        VotePoll memory currentVote = forms[_voteId];

        voteId = _voteId;
        owner = currentVote.owner;
        ipfsHash = currentVote.ipfs;
    }

    function getVote(
        uint256 _voteId,
        address fromAddress
    ) public view voteRequired(_voteId) returns (bytes32) {
        return data[_voteId][fromAddress];
    }

    function submitVote(
        uint256 _voteId,
        bytes32 ipfsHash,
        bytes[] calldata _multiSignature
    )
        external
        onlyNonContract
        whenNotPaused
        voteRequired(_voteId)
        haveNotVotedYetAllowed(_voteId)
    {
        address voter = _msgSender();
        _verifyMultiSignature(_voteId, voter, ipfsHash, _multiSignature);

        data[_voteId][voter] = ipfsHash;

        emit CreateVote(_voteId, voter, ipfsHash);
    }

    function _processSubmitInfo(
        uint256 _voteId,
        address voter,
        bytes32 ipfsHash
    ) private pure returns (bytes32 _digest) {
        _digest = keccak256(abi.encodePacked(_voteId, voter, ipfsHash));
        _digest = keccak256(abi.encodePacked(MSG_PREFIX, _digest));
        return _digest;
    }

    function _verifyMultiSignature(
        uint256 _voteId,
        address voter,
        bytes32 ipfsHash,
        bytes[] calldata _multiSignature
    ) private view {
        uint256 count = _multiSignature.length;
        require(count == 2, "not enough signers");

        bytes32 digest = _processSubmitInfo(_voteId, voter, ipfsHash);

        // signer
        bytes memory signature1 = _multiSignature[0];
        address signerAddress = ECDSA.recover(digest, signature1);
        require(signers[signerAddress], "invalid signer");

        // user
        bytes memory signature2 = _multiSignature[1];
        address senderAddress = ECDSA.recover(digest, signature2);
        require(senderAddress == voter, "invalid sender");
    }

    modifier voteRequired(uint256 _voteId) {
        VotePoll memory currentVote = forms[_voteId];
        require(currentVote.ipfs != bytes32(0), "Vote poll do not exist");
        _;
    }


    modifier haveNotVotedYetAllowed(uint256 _voteId) {
        address voter = _msgSender();

        require(data[_voteId][voter] == bytes32(0), "Voted already");
        _;
    }

    /**
     * @dev user must be not smart contract
     */
    modifier onlyNonContract() {
        _onlyNonContract();
        _;
    }

    function _onlyNonContract() internal view {
        address sender = _msgSender();
        require(sender != address(0), "Invalid sender address");
        require(sender == tx.origin, "Non contract required");
    }
}
