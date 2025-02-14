import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { localChain, requestLocalTestEth } from '../config/web3';
import '../styles/FaucetInfo.css';

const FaucetInfo = () => {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [isOpen, setIsOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isConnected) return null;

  const isLocalNetwork = chainId === localChain.id;
  const tokenSymbol = isLocalNetwork ? 'ETH' : 'WLD';

  const handleRequestTestEth = async () => {
    if (!address) return;
    setIsRequesting(true);
    try {
      const success = await requestLocalTestEth(address);
      if (success) {
        alert(`100 test ${tokenSymbol} sent to your wallet!`);
      } else {
        alert(`Error requesting test ${tokenSymbol}. Is the local node running?`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error requesting test ${tokenSymbol}`);
    }
    setIsRequesting(false);
  };

  return (
    <div className="faucet-info">
      <button 
        className="faucet-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Need test tokens?</span>
        <span className={`toggle-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="faucet-steps">
          {isLocalNetwork ? (
            <div className="step">
              <h4>Get Test ETH</h4>
              <p>Get test ETH for the local network</p>
              <button 
                className="faucet-link"
                onClick={handleRequestTestEth}
                disabled={isRequesting}
              >
                {isRequesting ? 'Requesting...' : `Get 100 Test ${tokenSymbol}`}
              </button>
            </div>
          ) : (
            <>
              <div className="step">
                <h4>Step 1: Get Sepolia ETH</h4>
                <p>You need Sepolia ETH to bridge to World Chain</p>
                <a 
                  href="https://sepoliafaucet.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="faucet-link"
                >
                  Get Sepolia ETH →
                </a>
              </div>
              <div className="step">
                <h4>Step 2: Bridge to World Chain</h4>
                <p>Use the official Alchemy bridge to convert Sepolia ETH to WLD</p>
                <a 
                  href="https://worldchain-sepolia.bridge.alchemy.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="faucet-link"
                >
                  Go to Testnet Bridge →
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FaucetInfo;
