// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {FP_CoolNFT} from "../../src/Faillapop_CoolNFT.sol";
import {FP_DAO} from "../../src/Faillapop_DAO.sol";
import {FP_PowersellerNFT} from "../../src/Faillapop_PowersellerNFT.sol";
import {FP_Shop} from "../../src/Faillapop_shop.sol";
import {FP_Token} from "../../src/Faillapop_ERC20.sol";
import {FP_Vault} from "../../src/Faillapop_vault.sol";
import {FP_Proxy} from "../../src/Faillapop_Proxy.sol";
import {DeployFaillapop} from "../../script/DeployFaillapop.s.sol";

contract Faillapop_CoolNFT_Test is Test {
    
    FP_CoolNFT public coolNFT;
    FP_DAO public dao;
    FP_Token public token;     
    FP_Vault public vault;   
    FP_Shop public shop;
    FP_PowersellerNFT public powersellerNFT;
    FP_Proxy public proxy;

    address public constant USER1 = address(0x1);
    address public constant USER2 = address(0x2);

    /************************************** Modifiers **************************************/

    modifier mint(uint256 times) {
        for(uint256 i = 0; i < times; i++) {
            // Anyone can mint in vulnerable version
            coolNFT.mintCoolNFT(USER1);
        }
        _;
    }

    /************************************** Set Up **************************************/

    function setUp() external {
        vm.deal(USER1, 10);

        DeployFaillapop deploy = new DeployFaillapop();
        (shop, token, coolNFT, powersellerNFT, dao, vault, proxy) = deploy.run();
    }

    /************************************** Tests **************************************/

    function test_SetUp() public view {
        assertEq(coolNFT.name(), "Vulnerable Cool NFT", "Incorrect token name");
        assertEq(coolNFT.symbol(), "vCNFT", "Incorrect token symbol");
    }    

    // Test that setDAO has no effect (vulnerability)
    function test_setDao_NoEffect() public {
        coolNFT.setDAO(address(dao));
        // No effect expected, no need for assertions
    }

    function test_mintCoolNFT_AnyoneCanMint() public {
        // Anyone can mint
        coolNFT.mintCoolNFT(USER1);
        
        assertEq(coolNFT.balanceOf(USER1), 1, "Incorrect balance");
        assertEq(coolNFT.nextTokenId(), 1, "Incorrect next token id");
        assertEq(coolNFT.ownerOf(1), USER1, "Incorrect owner");
    }

    function test_mintCoolNFT_multipleTimes() public mint(15) {
        assertEq(coolNFT.balanceOf(USER1), 15, "Incorrect balance");
        for(uint256 i = 0; i < 15; i++) {
            assertEq(coolNFT.ownerOf(i+1), USER1, "Incorrect owner");
        }
    }
    
    function test_burnAll_AnyoneCanBurn() public mint(1) {
        // Anyone can burn in vulnerable version
        coolNFT.burnAll(USER1);
        
        assertEq(coolNFT.balanceOf(USER1), 0, "Incorrect balance");
        vm.expectRevert("ERC721NonexistentToken(1)");
        coolNFT.ownerOf(1);
    }

    function test_burnAll_multipleCoolNFTs() public mint(15) {
        // Anyone can burn in vulnerable version
        coolNFT.burnAll(USER1);

        assertEq(coolNFT.balanceOf(USER1), 0, "Incorrect balance");
        for(uint256 i = 1; i <= 15; i++) {
            string memory expectedError = string.concat("ERC721NonexistentToken(", vm.toString(i), ")");
            vm.expectRevert(bytes(expectedError));
            coolNFT.ownerOf(i);
        }
    }

    function test_approve() public mint(1) {
        vm.prank(USER1);
        vm.expectRevert("CoolNFT cannot be approved");
        coolNFT.approve(USER2, 1);
    }

    function test_setApprovalForAll() public mint(1) {
        vm.prank(USER1);
        vm.expectRevert("CoolNFT cannot be approved");
        coolNFT.setApprovalForAll(USER2, true);
    }
    
    function test_transferFrom() public mint(1) {
        vm.prank(USER1);
        vm.expectRevert("CoolNFT cannot be transferred");
        coolNFT.transferFrom(USER1, USER2, 1);
    }

    function test_safeTransferFrom() public mint(1) {
        vm.prank(USER1);
        vm.expectRevert("CoolNFT cannot be transferred");
        coolNFT.safeTransferFrom(USER1, USER2, 1);
    }
    
    function test_safeTransferFrom_withData() public mint(1) {
        vm.prank(USER1);
        vm.expectRevert("CoolNFT cannot be transferred");
        coolNFT.safeTransferFrom(USER1, USER2, 1, "data");
    }
}