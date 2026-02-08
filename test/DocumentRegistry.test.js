const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DocumentRegistry", function () {
    let DocumentRegistry;
    let documentRegistry;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
        documentRegistry = await DocumentRegistry.deploy();
        await documentRegistry.waitForDeployment();
    });

    it("Should add a new document", async function () {
        const ipfsHash = "QmTestHash123";
        const fileHash = "0x123456789abcdef";
        const fileName = "test.txt";

        await documentRegistry.addDocument(ipfsHash, fileHash, fileName);

        const doc = await documentRegistry.verifyDocument(fileHash);
        expect(doc.ipfsHash).to.equal(ipfsHash);
        expect(doc.owner).to.equal(owner.address);
        expect(doc.isVerified).to.equal(true);
    });

    it("Should fail if document already exists", async function () {
        const ipfsHash = "QmTestHash123";
        const fileHash = "0x123456789abcdef";
        const fileName = "test.txt";

        await documentRegistry.addDocument(ipfsHash, fileHash, fileName);

        await expect(
            documentRegistry.addDocument("QmNewHash", fileHash, "test2.txt")
        ).to.be.revertedWith("Document already registered");
    });

    it("Should return empty for non-existent document", async function () {
        const doc = await documentRegistry.verifyDocument("non-existent-hash");
        expect(doc.isVerified).to.equal(false);
    });
});
