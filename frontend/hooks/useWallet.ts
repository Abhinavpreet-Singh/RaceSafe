import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await browserProvider.listAccounts();
          
          if (accounts.length > 0) {
            const network = await browserProvider.getNetwork();
            setProvider(browserProvider);
            setWalletState({
              address: accounts[0].address,
              chainId: Number(network.chainId),
              isConnected: true,
              isConnecting: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setWalletState({
            address: null,
            chainId: null,
            isConnected: false,
            isConnecting: false,
            error: null,
          });
          setProvider(null);
        } else {
          // User switched accounts
          setWalletState((prev) => ({
            ...prev,
            address: accounts[0],
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        // Reload the page on chain change as recommended by MetaMask
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.ethereum) {
      setWalletState((prev) => ({
        ...prev,
        error: 'MetaMask or another Web3 wallet is not installed. Please install one to continue.',
      }));
      return;
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setWalletState({
        address: accounts[0],
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setWalletState({
        address: null,
        chainId: null,
        isConnected: false,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      });
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
    setProvider(null);
  }, []);

  const getSigner = useCallback(async () => {
    if (!provider) return null;
    return await provider.getSigner();
  }, [provider]);

  return {
    ...walletState,
    provider,
    connectWallet,
    disconnectWallet,
    getSigner,
  };
}
