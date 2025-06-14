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
import "./interfaces/IFP_DAO.sol";

contract FP_DAO_Vulnerable is IFP_DAO {
    IERC20 public immutable token; // token FPT utilizado para ponderar votos
    address public shop; // dirección del contrato de la tienda
    address public admin; // dirección del administrador del DAO

    uint256 public constant COMMIT_WIN = 5 minutes; // Ventana de commit
    uint256 public constant REVEAL_WIN = 5 minutes; // Ventana de reveal

    // Estructuras
    struct VoteCommit {
        address voter; // Dirección del votante
        bytes32 commit; // Hash del voto (voto + secreto)
        bool revealed; // Indica si el voto ha sido revelado
    }

    struct Dispute {
        uint256 itemId; // ID del artículo en disputa
        string buyerReasoning; // Argumentación del comprador
        string sellerReasoning; // Argumentación del vendedor
        uint256 commitEnd; // Timestamp de finalización de la ventana de commit
        uint256 revealEnd; // Timestamp de finalización de la ventana de reveal
        bool open; // Indica si la disputa está abierta
        bool buyerWon; // Resultado
        uint256 votesFor; // Votos a favor del comprador
        uint256 votesAgainst; // Votos en contra del comprador
        VoteCommit[] commits; // **Permite commits duplicados**
    }

    mapping(uint256 => Dispute) public disputes; // Mapa de disputas por ID
    uint256 public nextDisputeId; // ID de la siguiente disputa

    struct Proposal {
        address newShop;
        uint256 deadline;
        bool executed;
        bool open;
        uint256 votesFor;
        uint256 votesAgainst;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public nextProposalId;

    // Constructor
    constructor(IERC20 _token) {
        token = _token;
        admin = msg.sender; // El creador del contrato es el administrador
    }

    // Gestion de la tienda
    function setShop(address _shop) external override {
        require(msg.sender == shop || msg.sender == admin, "unauthorised");
        shop = _shop;
    }

    // Gestion de disputas
    function newDispute(
        uint256 itemId,
        string calldata buyerReasoning,
        string calldata sellerReasoning
    ) external override returns (uint256) {
        Dispute storage d = disputes[nextDisputeId];
        d.itemId = itemId;
        d.buyerReasoning = buyerReasoning;
        d.sellerReasoning = sellerReasoning;
        d.commitEnd = block.timestamp + COMMIT_WIN;
        d.revealEnd = d.commitEnd + REVEAL_WIN;
        d.open = true;
        return nextDisputeId++;
    }

    function commitVoteOnDispute(
        uint256 disputeId,
        bytes32 commit
    ) external override {
        Dispute storage d = disputes[disputeId];
        require(d.open, "closed");
        require(block.timestamp < d.commitEnd, "commit over");

        // *** VULNERABILIDAD 1 ***
        // No impedimos commits repetidos del mismo usuario.
        // Además, cada commit RESETEA los plazos usando block.timestamp,
        // lo que permite al atacante prorrogar la votación indefinidamente.
        d.commitEnd = block.timestamp + COMMIT_WIN;
        d.revealEnd = d.commitEnd + REVEAL_WIN;

        d.commits.push(
            VoteCommit({voter: msg.sender, commit: commit, revealed: false})
        );
    }

    function revealDisputeVote(
        uint disputeId,
        bool vote,
        string calldata secret
    ) external override {
        Dispute storage d = disputes[disputeId];
        require(d.open, "closed");
        require(block.timestamp >= d.commitEnd, "commit phase");
        require(block.timestamp < d.revealEnd, "reveal over");

        bytes32 check = keccak256(abi.encodePacked(vote, secret));

        for (uint i = 0; i < d.commits.length; i++) {
            VoteCommit storage vc = d.commits[i];

            // *** VULNERABILIDAD 2 ***
            // Cualquiera puede revelar cualquier commit si conoce un secret válido.
            // El campo `revealed` se actualiza pero no se comprueba antes ⇒
            // un atacante puede revelar múltiples commits con el MISMO balance.
            if (vc.commit == check && !vc.revealed) {
                vc.revealed = true;

                uint256 weight = token.balanceOf(msg.sender); // *** lecturas repetidas con los mismos tokens ***
                if (vote) {
                    d.votesFor += weight;
                } else {
                    d.votesAgainst += weight;
                }

                // *** VULNERABILIDAD 3 ***
                // Cada reveal extiende la ventana → los mineros pueden ajustar timestamp
                // para retrasar el cierre si les conviene.
                d.revealEnd = block.timestamp + REVEAL_WIN;
            }
        }
    }

    function endDispute(uint256 disputeId) external override {
        Dispute storage d = disputes[disputeId];
        require(d.open, "already ended");
        require(block.timestamp >= d.revealEnd, "too early");

        d.open = false;
        d.buyerWon = d.votesFor > d.votesAgainst;
        // Reembolsos / lógica de pago omitidos para el ejercicio
    }

    function cancelDispute(uint256 disputeId) external override {
        Dispute storage d = disputes[disputeId];
        require(d.open, "closed");
        d.open = false; // cualquiera puede cancelar ⇒ DoS
    }

    function checkLottery(uint256) external override {}

    // =========================  Upgrade Proposals — sin implementar  ========================= //

    function newUpgradeProposal(
        address /*addrNewShop*/
    ) external pure override returns (uint) {
        revert("Proposals disabled in this build");
    }

    function castVoteOnProposal(
        uint /*proposalId*/,
        bool /*vote*/
    ) external pure override {
        revert("Proposals disabled in this build");
    }

    function cancelProposalByCreator(
        uint /*proposalId*/
    ) external pure override {
        revert("Proposals disabled in this build");
    }

    function cancelProposal(
        uint /*proposalId*/,
        string calldata /*magicWord*/
    ) external pure override {
        revert("Proposals disabled in this build");
    }

    function resolveUpgradeProposal(
        uint256 /*proposalId*/
    ) external pure override {
        revert("Proposals disabled in this build");
    }

    function executePassedProposal(
        uint256 /*proposalId*/
    ) external pure override {
        revert("Proposals disabled in this build");
    }
}
