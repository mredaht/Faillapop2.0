// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/*
 * Template ERC20 token for governance
 */

import {ERC20} from "@openzeppelin/contracts@v5.0.1/token/ERC20/ERC20.sol";

/**
 * @title FaillaPop Token
 * @notice ERC-20 sin roles
 */
contract FP_Token is ERC20 {
    constructor() ERC20("FaillaPop Token", "FPT") {}

    /**
     * @dev Sin restricciones, cualquiera llama `mint` y genera tokens.
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
