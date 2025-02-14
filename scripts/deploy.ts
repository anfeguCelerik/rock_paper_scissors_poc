import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

declare const hre: HardhatRuntimeEnvironment;
dotenv.config();

async function main() {
  console.log("Deploying RockPaperScissors contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
  const rockPaperScissors = await RockPaperScissors.deploy();

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
  fs.writeFileSync(addressFile, JSON.stringify(addressData, null, 2));
  console.log("Contract address saved to:", addressFile);

  // Esperar un poco para que la transacción se confirme
  console.log("Waiting for confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30 segundos

  // Verificar el contrato
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        contract: "contracts/RockPaperScissors.sol:RockPaperScissors",
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Error verifying contract:", error);
    }
  } else {
    console.log("Skipping contract verification");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
