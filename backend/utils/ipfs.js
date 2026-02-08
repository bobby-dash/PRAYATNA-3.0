const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Using Pinata for IPFS
// Env variables: PINATA_API_KEY, PINATA_SECRET_API_KEY

const uploadToIPFS = async (fileBuffer, fileName) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let data = new FormData();
    data.append('file', fileBuffer, { filename: fileName });
    data.append('pinataMetadata', JSON.stringify({
        name: fileName
    }));

    try {
        const response = await axios.post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
            }
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('IPFS Upload Failed');
    }
};

const getFromIPFS = async (ipfsHash) => {
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching from IPFS:', error);
        throw new Error('IPFS Fetch Failed');
    }
};

module.exports = { uploadToIPFS, getFromIPFS };
