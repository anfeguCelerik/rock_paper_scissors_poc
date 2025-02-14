import { useAccount, useChainId, useConnect, useDisconnect, useBalance } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { localChain, worldChainSepolia } from './config/web3';
import Game from './components/Game';
import FaucetInfo from './components/FaucetInfo';
import './App.css';

function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  const isLocalNetwork = chainId === localChain.id;
  const networkName = isLocalNetwork ? 'Hardhat Local' : 'World Chain Sepolia';
  const tokenSymbol = isLocalNetwork ? 'ETH' : 'WLD';

  const handleConnect = async () => {
    try {
      await connect({ connector: metaMask() });
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <span className="address" onClick={() => disconnect()} style={{ cursor: 'pointer' }}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <div className="balance">
          {balance?.formatted.slice(0, 6)} {tokenSymbol}
        </div>
        <div className="network-info">
          <span className="network-badge">{networkName}</span>
          <span className="token-badge">{tokenSymbol}</span>
        </div>
      </div>
    );
  }

  return (
    <button className="connect-button" onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}

function App() {
  return (
    <div className="app">
      <h1>Rock Paper Scissors</h1>
      <div className="wallet-status">
        <ConnectButton />
      </div>
      <FaucetInfo />
      <Game />
    </div>
  );
}

export default App;