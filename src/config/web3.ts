import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { metaMask } from 'wagmi/connectors';
import { ethers } from 'ethers';

// Definir World Chain Sepolia
export const worldChainSepolia = defineChain({
  id: 4801,
  name: 'World Chain Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'World Coin',
    symbol: 'WLD',
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
    },
    public: {
      http: ['https://worldchain-sepolia.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://worldchain-sepolia.explorer.alchemy.com',
    },
  },
  testnet: true,
});

// Definir red local de Hardhat
export const localChain = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
});

// Configuración para ambas redes
export const wagmiConfig = createConfig({
  chains: [worldChainSepolia, localChain],
  connectors: [
    metaMask(),
  ],
  transports: {
    [worldChainSepolia.id]: http(),
    [localChain.id]: http(),
  },
});

// Función para agregar World Chain a MetaMask
export const addWorldChainToMetaMask = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${worldChainSepolia.id.toString(16)}`,
            chainName: worldChainSepolia.name,
            nativeCurrency: worldChainSepolia.nativeCurrency,
            rpcUrls: worldChainSepolia.rpcUrls.default.http,
            blockExplorerUrls: [worldChainSepolia.blockExplorers.default.url],
          },
        ],
      });
      return true;
    } catch (error) {
      console.error('Error adding World Chain to MetaMask:', error);
      return false;
    }
  }
  return false;
};

// Función para agregar la red local a MetaMask
export const addLocalChainToMetaMask = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${localChain.id.toString(16)}`,
            chainName: localChain.name,
            nativeCurrency: localChain.nativeCurrency,
            rpcUrls: localChain.rpcUrls.default.http,
          },
        ],
      });
      return true;
    } catch (error) {
      console.error('Error adding Local Chain to MetaMask:', error);
      return false;
    }
  }
  return false;
};

// Función para obtener ETH de prueba en la red local
export const requestLocalTestEth = async (address: string) => {
  try {
    // Conectar al nodo local de Hardhat
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Obtener la primera cuenta (que tiene todos los fondos)
    const signer = await provider.getSigner(0);
    
    // Enviar 100 ETH a la dirección solicitada
    const tx = await signer.sendTransaction({
      to: address,
      value: ethers.parseEther('100.0')
    });
    
    // Esperar a que se confirme la transacción
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error('Error requesting test ETH:', error);
    return false;
  }
};
