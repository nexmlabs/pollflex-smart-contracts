// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MarketPrediction is Ownable, AccessControl {
    /**variable*/
    using Counters for Counters.Counter;
    Counters.Counter private _voteId;
    Counters.Counter private _formId;
    Counters.Counter private _dataId;

    string private _voteUrl;
    string private _formUrl;
    string private _dataUrl;

    mapping(uint256 => address) private _ownersVote;
    mapping(uint256 => address) private _ownersForm;
    mapping(uint256 => address) private _ownersData;

    mapping(uint256 => mapping(address => bool)) hasVoted;
    mapping(uint256 => mapping(address => bool)) hasSubmittedForm;
    mapping(uint256 => mapping(address => string)) voteData;

    event CreateVote(address indexed from, uint256 indexed voteId);
    event CreateForm(address indexed from, uint256 indexed formId);

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /**constructor */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /**function */
    function createVote() external returns (uint256) {
        require(msg.sender != address(0), "Invalid sender address.");

        _voteId.increment();
        uint256 _voteIdCurrent = _voteId.current();

        require(
            _ownersVote[_voteIdCurrent] == address(0),
            "Vote already created for this ID."
        );
        _ownersVote[_voteIdCurrent] = msg.sender;

        emit CreateVote(msg.sender, _voteIdCurrent);
        return _voteIdCurrent;
    }

    function createForm() external returns (uint256) {
        require(msg.sender != address(0), "Invalid sender address.");

        _formId.increment();
        uint256 _formIdCurrent = _formId.current();

        require(
            _ownersForm[_formIdCurrent] == address(0),
            "Form already created for this ID."
        );
        _ownersForm[_formIdCurrent] = msg.sender;

        emit CreateForm(msg.sender, _formIdCurrent);
        return _formIdCurrent;
    }

    function submitVote(uint256 _submitId) {}

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
