// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import {IFP_Proxy} from "./interfaces/IFP_Proxy.sol";
import {ERC1967Utils} from "@openzeppelin/contracts@v5.0.1/proxy/ERC1967/ERC1967Utils.sol";

/**
 * @title FaillaPop Proxy Contract
 * @notice Proxy EIP-1967 SIN control de acceso: cualquiera puede llamar
 *         `upgradeToAndCall` y fijar una implementación maliciosa.
 */
contract FP_Proxy is IFP_Proxy {
    /************************************** Constants *******************************************************/
    /* slot oficial EIP-1967 = keccak256(\"eip1967.proxy.implementation\")-1 */
    bytes32 private constant _IMPLEMENTATION_SLOT =
        0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC;

    /** -------- constructor -------- */
    constructor(address initialImpl, bytes memory data) payable {
        // escribe la implementación
        ERC1967Utils.upgradeToAndCall(initialImpl, data);
    }

    /** -------- VULNERABLE ENTRYPOINT -------- */
    function upgradeToAndCall(
        address newImpl,
        bytes memory data
    ) external override {
        ERC1967Utils.upgradeToAndCall(newImpl, data);
    }

    /* ─────────── Getter de implementación ─────────── */
    function getImplementation() external view override returns (address impl) {
        assembly {
            let slot := _IMPLEMENTATION_SLOT
            impl := sload(slot)
        }
    }

    /* Delegación */
    fallback() external payable {
        _delegate();
    }

    receive() external payable {
        _delegate();
    }

    function _delegate() internal {
        address impl;
        assembly {
            let slot := _IMPLEMENTATION_SLOT
            impl := sload(slot)
        }

        assembly {
            calldatacopy(0, 0, calldatasize())
            let r := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch r
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
