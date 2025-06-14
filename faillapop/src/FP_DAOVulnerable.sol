// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/**
 * @title Vulnerable implementation of the FaillaPop DAO (for CTF / mock‑audit)
 * @notice ¡Esta versión está *deliberadamente* rota! Incorpora una condición
 *         de carrera y un uso inseguro de `block.timestamp` que permite votar
 *         varias veces con los mismos tokens y alargar el periodo de votación
 *         a voluntad.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IFP_DAO.sol";

contract FP_DAO_Vulnerable is IFP_DAO {}
