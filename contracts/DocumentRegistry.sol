// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DocumentRegistry {
    
    struct Document {
        string ipfsHash;    // IPFS CID of the encrypted file
        string fileHash;    // SHA-256 hash of the original file content (for integrity)
        address owner;      // Address of the user who uploaded
        uint256 timestamp;  // Block timestamp
        string name;        // Name of the document
    }

    // Mapping from fileHash to Document details
    // Using fileHash as key ensures we can verify integrity primarily by content
    mapping(string => Document) private documents;
    
    // Mapping to track if a fileHash exists
    mapping(string => bool) private documentExists;

    // Mapping to store list of fileHashes owned by an address
    mapping(address => string[]) private userDocuments;

    event DocumentAdded(string indexed fileHash, string ipfsHash, address indexed owner, uint256 timestamp);
    
    // Modifier to check if document already exists
    modifier activeDocument(string memory _fileHash) {
        require(documentExists[_fileHash], "Document does not exist");
        _;
    }

    /**
     * @dev Normalize file hash to lowercase to ensure consistency
     * @param _input The string to lower case
     */
    function _toLower(string memory _input) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_input);
        for (uint i = 0; i < strBytes.length; i++) {
            if ((uint8(strBytes[i]) >= 65) && (uint8(strBytes[i]) <= 90)) {
                strBytes[i] = bytes1(uint8(strBytes[i]) + 32);
            }
        }
        return string(strBytes);
    }

    /**
     * @dev Add a new document to the registry
     * @param _ipfsHash The IPFS CID
     * @param _fileHash The SHA-256 hash of the file
     * @param _name Display name of the file
     */
    function addDocument(string memory _ipfsHash, string memory _fileHash, string memory _name) public {
        // Enforce lowercase for consistency in lookup
        string memory normalizedFileHash = _toLower(_fileHash);
        
        require(!documentExists[normalizedFileHash], "Document already registered");
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS Hash");
        require(bytes(_fileHash).length > 0, "Invalid File Hash");

        Document memory newDoc = Document({
            ipfsHash: _ipfsHash,
            fileHash: normalizedFileHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            name: _name
        });

        documents[normalizedFileHash] = newDoc;
        documentExists[normalizedFileHash] = true;
        userDocuments[msg.sender].push(normalizedFileHash);

        emit DocumentAdded(normalizedFileHash, _ipfsHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify if a document exists and return its details
     * @param _fileHash The SHA-256 hash to verify
     * @return ipfsHash IPFS CID of the file
     * @return owner Address of the owner
     * @return timestamp Upload timestamp
     * @return name Name of the file
     * @return isVerified Verification status
     */
    function verifyDocument(string memory _fileHash) public view returns (
        string memory ipfsHash, 
        address owner, 
        uint256 timestamp, 
        string memory name,
        bool isVerified
    ) {
        string memory normalizedFileHash = _toLower(_fileHash);
        
        if (!documentExists[normalizedFileHash]) {
            return ("", address(0), 0, "", false);
        }

        Document memory doc = documents[normalizedFileHash];
        return (doc.ipfsHash, doc.owner, doc.timestamp, doc.name, true);
    }

    /**
     * @dev Get all document hashes owned by the caller
     */
    function getMyDocuments() public view returns (string[] memory) {
        return userDocuments[msg.sender];
    }
}
