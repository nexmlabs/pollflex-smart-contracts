// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MarketPrediction is AccessControl {
    /**variable*/
    using Counters for Counters.Counter;
    Counters.Counter private _voteId;
    Counters.Counter private _dataId;

    string private _voteUrl;
    string private _dataUrl;

    mapping(uint256 => bytes) private _ipfsHash;
    mapping(uint256 => address) private _ownersVote;
    mapping(uint256 => address) private _ownersData;

    mapping(uint256 => mapping(address => bool)) hasVoted;
    mapping(uint256 => mapping(address => string)) voteData;

    event CreateVote(address indexed from, uint256 indexed voteId);

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

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

    function getIpfsHash(uint256 id) public view returns (bytes memory) {
        return _ipfsHash[id];
    }

    function submitVote(
        uint256 _submitVoteId,
        uint256 _nonce,
        bytes[] calldata _multiSignature
    ) external {}

    function addAdmin(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, account);
    }

    function removeAdmin(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, account);
    }

    // function tokenURI(
    //     uint256 tokenId
    // ) public view virtual override returns (string memory) {
    //     require(_exists(tokenId), "URI query for nonexistent token");

    //     return
    //         bytes(metadataBaseUrl).length > 0
    //             ? string(
    //                 abi.encodePacked(
    //                     "https://",
    //                     metadataBaseUrl,
    //                     "/v1/",
    //                     tokenId,
    //                     ".json"
    //                 )
    //             )
    //             : "";
    // }
}
