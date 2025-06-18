// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/contracts/FP_Shop.sol";

contract DeployScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        FP_Shop shop = new FP_Shop();

        vm.stopBroadcast();

        // Guardar la dirección del contrato
        string memory addressStr = vm.toString(address(shop));
        string memory configPath = "frontend/src/contracts/config.ts";
        string memory configContent = string.concat(
            '// Import ABIs from local files\n',
            'import FP_Shop from \'./abis/FP_Shop.json\';\n\n',
            '// Contract addresses from Foundry deployment\n',
            'export const FAILLAPOP_SHOP_ADDRESS = "',
            addressStr,
            '";\n\n',
            '// Export ABIs\n',
            'export const FAILLAPOP_SHOP_ABI = FP_Shop.abi;\n'
        );
        vm.writeFile(configPath, configContent);
    }
} 