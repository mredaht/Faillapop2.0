import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    // Conectar a Anvil
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider); // Clave privada de Anvil

    console.log('Deploying contracts with the account:', wallet.address);

    // Compilar el contrato (esto debería hacerse con hardhat o foundry en producción)
    const contractPath = path.join(__dirname, '../src/contracts/FP_Shop.sol');
    const contractSource = fs.readFileSync(contractPath, 'utf8');

    // Crear la factory del contrato
    const FP_Shop = new ethers.ContractFactory(
        [
            "constructor()",
            "function listItem(string memory _name, string memory _description, uint256 _price) public",
            "function buyItem(uint256 _itemId) public payable",
            "function nextItemId() public view returns (uint256)",
            "function isBlacklisted(address _address) public view returns (bool)",
            "function blacklist(address _address) public"
        ],
        contractSource,
        wallet
    );

    // Desplegar el contrato
    const shop = await FP_Shop.deploy();
    await shop.deployed();

    console.log('FP_Shop deployed to:', shop.address);

    // Guardar la dirección del contrato
    const configPath = path.join(__dirname, '../frontend/src/contracts/config.ts');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Actualizar la dirección del contrato
    configContent = configContent.replace(
        /export const FAILLAPOP_SHOP_ADDRESS = ".*?";/,
        `export const FAILLAPOP_SHOP_ADDRESS = "${shop.address}";`
    );

    fs.writeFileSync(configPath, configContent);
    console.log('Updated contract address in config.ts');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 