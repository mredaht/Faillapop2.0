// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import {IFP_Proxy} from "./interfaces/IFP_Proxy.sol";
import {ERC1967Upgrade} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";
import {ERC1967Utils} from "@openzeppelin/contracts@v5.0.1/proxy/ERC1967/ERC1967Utils.sol";

/**
 * @title FaillaPop Proxy Contract
 * @notice Proxy EIP-1967 SIN control de acceso: cualquiera puede llamar
 *         `upgradeToAndCall` y fijar una implementación maliciosa.
 */
contract FP_Proxy is ERC1967Proxy, ERC1967Upgrade, IFP_Proxy {
    /// @notice despliega el proxy con una implementación inicial
    /// @param impl   contrato de lógica inicial
    /// @param data   calldata de inicialización (puede ser "" si no se necesita)
    constructor(
        address impl,
        bytes memory initCalldata
    ) ERC1967Proxy(impl, initCalldata) {}

    /** -------- VULNERABLE ENTRYPOINT -------- */
    function upgradeToAndCall(
        address newImpl,
        bytes memory data
    ) external override {
        _upgradeToAndCall(newImpl, data);
    }

    /**
     * @return impl dirección de la implementación actual (EIP‑1967)
     */
    function getImplementation() external view override returns (address impl) {
        impl = _getImplementation();
    }
}
