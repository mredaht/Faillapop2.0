// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {FP_CoolNFT} from "../src/Faillapop_CoolNFT.sol";
import {FP_DAO} from "../src/Faillapop_DAO.sol";
import {FP_PowersellerNFT} from "../src/Faillapop_PowersellerNFT.sol";
import {FP_Shop} from "../src/Faillapop_shop.sol";
import {FP_Token} from "../src/Faillapop_ERC20.sol";
import {FP_Vault} from "../src/Faillapop_vault.sol";
import {FP_Proxy} from "../src/Faillapop_Proxy.sol";

contract DeployFaillapop is Script {
    // Clave privada de prueba de Anvil (primera cuenta)
    uint256 constant PRIVATE_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    function run() external returns(FP_Shop shop, FP_Token token, FP_CoolNFT coolNFT, FP_PowersellerNFT powersellerNFT, FP_DAO dao, FP_Vault vault, FP_Proxy proxy) {
        vm.startBroadcast(PRIVATE_KEY);
        shop = new FP_Shop();
        token = new FP_Token();
        coolNFT = new FP_CoolNFT();
        powersellerNFT = new FP_PowersellerNFT();
        dao = new FP_DAO("password", address(coolNFT), address(token));
        vault = new FP_Vault(address(powersellerNFT), address(dao));
        proxy = new FP_Proxy(
            address(shop), 
            abi.encodeWithSignature(
                "initialize(address,address,address,address)",
                address(dao),
                address(vault), 
                address(powersellerNFT),
                address(coolNFT)
                ), 
            address(dao)
        );

        vault.setShop(address(proxy));
        dao.setShop(address(proxy));
        powersellerNFT.setShop(address(proxy));
        coolNFT.setDAO(address(dao));
        vm.stopBroadcast();
    }
}