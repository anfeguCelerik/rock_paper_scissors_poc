require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// Configuración base con redes locales
const config = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 2100000,
      gasPrice: 8000000000,
      blockGasLimit: 10000000
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
      gas: 2100000,
      gasPrice: 8000000000,
      blockGasLimit: 10000000
    }
  },
  paths: {
    artifacts: "./src/artifacts",
  },
};

// Agregar World Chain Sepolia solo si existe la clave privada
if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 64) {
  config.networks.worldSepolia = {
    url: process.env.WORLD_SEPOLIA_RPC_URL || "https://worldchain-sepolia.g.alchemy.com/public",
    chainId: 4801,
    accounts: [`0x${process.env.PRIVATE_KEY}`],
  };
}

module.exports = config;
