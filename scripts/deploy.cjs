const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log("Deploying RockPaperScissors contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Establecer un balance alto para el despliegue
  await ethers.provider.send("hardhat_setBalance", [
    deployer.address,
    "0x21E19E0C9BAB2400000" // 40 ETH en hex
  ]);

  const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
  
  // Desplegar el contrato con 20 ETH iniciales
  const rockPaperScissors = await RockPaperScissors.deploy({
    value: ethers.parseEther("20.0")
  });

  console.log("Waiting for deployment...");
  const contract = await rockPaperScissors.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("RockPaperScissors deployed to:", contractAddress);

  // Actualizar el archivo .env con la dirección del contrato
  const envContent = fs.readFileSync('.env', 'utf-8');
  const updatedEnvContent = envContent.replace(
    /CONTRACT_ADDRESS=.*/,
    `CONTRACT_ADDRESS=${contractAddress}`
  );
  fs.writeFileSync('.env', updatedEnvContent);

  // Actualizar el archivo contract-address.json
  const addressFile = path.join(__dirname, '../src/contracts/contract-address.json');
  const addressData = {
    RockPaperScissors: contractAddress
  };

  // Asegurarse de que el directorio existe
  const dir = path.dirname(addressFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(addressFile, JSON.stringify(addressData, null, 2));
  console.log("Contract address saved to:", addressFile);

  // Verificar el balance del contrato
  const contractBalance = await ethers.provider.getBalance(contractAddress);
  console.log("Contract balance:", ethers.formatEther(contractBalance), "ETH");

  // Reducir el balance del deployer para pruebas
  await ethers.provider.send("hardhat_setBalance", [
    deployer.address,
    "0x1BC16D674EC80000" // 2 ETH en hex
  ]);

  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(deployerBalance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
