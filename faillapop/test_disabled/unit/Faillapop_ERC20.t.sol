// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {FP_Token} from "../../src/Faillapop_ERC20.sol";

contract Faillapop_ERC20_Test is Test {
    
    FP_Token public token;
    address public constant ADMIN = address(0x1);
    address public constant USER = address(0x2);

    /************************************** Set Up **************************************/

    function setUp() external {
        vm.deal(ADMIN, 10);
        vm.deal(USER, 10);
        token = new FP_Token();
    }

    /************************************** Tests **************************************/

    function test_setUp() public {
        // No initial supply in vulnerable version
        assertEq(token.balanceOf(address(ADMIN)), 0, "Initial balance should be 0");
    }

    function testTokenNameAndSymbol() public {
        assertEq(token.name(), "FaillaPop Token", "Incorrect token name");
        assertEq(token.symbol(), "FPT", "Incorrect token symbol");
    }

    function test_mint_AnyoneCanMint() public {
        address to = USER;
        uint256 amount = 1000;

        // Anyone can mint in vulnerable version
        token.mint(to, amount);
        assertEq(token.balanceOf(to), amount, "Incorrect token balance after minting");

        // Even USER can mint for themselves
        vm.prank(USER);
        token.mint(USER, amount);
        assertEq(token.balanceOf(USER), amount * 2, "Incorrect token balance after second mint");
    }

    function test_mint_NoLimit() public {
        address to = USER;
        uint256 largeAmount = 1000000000 * 10**18; // 1 billion tokens

        // Can mint any amount in vulnerable version
        token.mint(to, largeAmount);
        assertEq(token.balanceOf(to), largeAmount, "Should be able to mint large amounts");
    }
}