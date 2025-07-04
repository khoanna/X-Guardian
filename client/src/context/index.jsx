import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppKitAccount } from "@reown/appkit/react";
import { ethers } from 'ethers'
import { contractAddress, ABI } from '@/constants/index'

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const { address, isConnected } = useAppKitAccount();
    const [contract, setContract] = useState();
    useEffect(() => {
        const connect = async () => {
            if (isConnected && address) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const reportContract = new ethers.Contract(contractAddress, ABI, signer)
                setContract(reportContract);
            }
        };
        connect();
    }, [isConnected, address]);

    const getWalletDetail = async (wallet) => {
        const walletData = await contract.getWalletDetail(wallet);
        
        return walletData;
    }

    const hasUserVoted = async (wallet, user) => {
        const hasVoted = await contract.hasUserVoted(wallet, user);
        return hasVoted;
    }

    const vote = async (wallet, index) => {
        const tx = await contract.vote(wallet, index);
        await tx.wait();
    }

    return (
        <StateContext.Provider value={{ getWalletDetail, hasUserVoted, vote, address, isConnected }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
