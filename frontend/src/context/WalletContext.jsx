import React, { createContext, useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, arbitrum, polygon } from '@reown/appkit/networks';
import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { ethers } from 'ethers'; // Keep for other utils if needed
import { toast } from 'react-hot-toast';
import axios from 'axios';

// 1. Get projectId
const projectId = '0f2e6d31966b27e5e50f322937ca642b';

// 2. Set capabilities
const networks = [mainnet, arbitrum, polygon];

// 3. Create a metadata object
const metadata = {
    name: 'Prayatna 3.0',
    description: 'Secure Document Sharing Platform',
    url: 'https://prayatna.app', // Update with real URL if available
    icons: ['https://assets.reown.com/reown-profile-pic.png']
};

// 4. Create the AppKit instance
createAppKit({
    adapters: [new EthersAdapter()],
    networks,
    metadata,
    projectId,
    features: {
        analytics: true
    }
});

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider('eip155');

    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    // Sync Reown state to our local state
    useEffect(() => {
        if (isConnected && address) {
            setAccount(address);
            syncWalletToBackend(address);
            toast.success("Wallet Connected via AppKit");
        } else {
            setAccount('');
            setSigner(null);
        }
    }, [isConnected, address]);

    // Initialize Ethers Provider from WalletProvider (if needed for signing)
    useEffect(() => {
        if (walletProvider) {
            const ethersProvider = new ethers.BrowserProvider(walletProvider);
            setProvider(ethersProvider);
            ethersProvider.getSigner().then(setSigner).catch(console.error);
        }
    }, [walletProvider]);

    const syncWalletToBackend = async (walletAddress) => {
        const token = localStorage.getItem('token');
        if (token && walletAddress) {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                await axios.post(`${apiUrl}/auth/update-wallet`, { walletAddress }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Wallet linked to account:", walletAddress);
            } catch (err) {
                console.error("Failed to link wallet to account", err);
            }
        }
    };

    const connectWallet = async () => {
        // Open the Reown AppKit Modal
        await open();
    };

    return (
        <WalletContext.Provider value={{ account, provider, signer, connectWallet }}>
            {children}
        </WalletContext.Provider>
    );
};
