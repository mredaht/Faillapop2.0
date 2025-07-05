import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ContractService } from '../services/ContractService';

interface VulnerableAdminPanelProps {
  contractService: ContractService;
  userAddress: string;
}

interface RealUserData {
  address: string;
  balance: string;
  vaultBalance: string;
  lockedBalance: string;
  itemsCreated: number;
  itemsSold: number;
  totalEarnings: string;
  isBlacklisted: boolean;
  isPowerseller: boolean;
  recentTransactions: Array<{
    hash: string;
    amount: string;
    type: string;
    timestamp: string;
    blockNumber: number;
  }>;
  contractInteractions: {
    vaultInteractions: number;
    shopInteractions: number;
    lastActivity: string;
  };
  // 🚨 VULNERABILIDAD: Datos sensibles que NO deberían estar disponibles
  sensitiveData: {
    privateKey: string;
    seedPhrase: string;
    internalNotes: string;
    riskScore: number;
  };
}

// Direcciones reales de Anvil (primeras 10 cuentas)
const ANVIL_ACCOUNTS = [
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    seedPhrase: 'test test test test test test test test test test test junk'
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    seedPhrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  },
  {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    seedPhrase: 'quality vacuum heart guard buzz spike sight swarm shove special gym robust assume'
  },
  {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    seedPhrase: 'ocean know abuse thank math perfect easy house goal credible thought curious'
  },
  {
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    seedPhrase: 'speed suit bag flash doll rescue economy paper mountain super ring security'
  },
  {
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    privateKey: '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
    seedPhrase: 'neither lonely flavor argue grass remind eye tag avocado spot unusual intact'
  },
  {
    address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    privateKey: '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
    seedPhrase: 'cloth swing fresh energy permanent punish coil neck rain oil collect worry'
  },
  {
    address: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    privateKey: '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
    seedPhrase: 'office refuse cousin human pumps water sister anxiety surprise headline dream champion'
  },
  {
    address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    privateKey: '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
    seedPhrase: 'uniform region friend witness pact april suggest mirror kit sauce work gadget'
  },
  {
    address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    privateKey: '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
    seedPhrase: 'phrase upgrade clock rough situate wedding elder cheese airport shuttle exact medium'
  }
];

export const VulnerableAdminPanel: React.FC<VulnerableAdminPanelProps> = ({
  contractService,
  userAddress
}) => {
  const [isAdminPanelVisible, setIsAdminPanelVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [adminAccessAttempted, setAdminAccessAttempted] = useState(false);
  const [bypassMethod, setBypassMethod] = useState<string>('');
  const [realUserData, setRealUserData] = useState<RealUserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos reales de Anvil cuando el admin panel se vuelve visible
  useEffect(() => {
    if (isAdminPanelVisible && realUserData.length === 0) {
      loadRealUserData();
    }
  }, [isAdminPanelVisible]);

  const loadRealUserData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData: RealUserData[] = [];
      
      // Obtener datos reales para cada cuenta de Anvil
      for (let i = 0; i < ANVIL_ACCOUNTS.length; i++) {
        const account = ANVIL_ACCOUNTS[i];
        
        try {
          // Obtener balance real de ETH
          const ethBalance = await contractService.getEthBalance(account.address);
          
          // Obtener datos del vault
          const vaultBalance = await contractService.getUserBalance(account.address);
          const lockedBalance = await contractService.getUserLockedBalance(account.address);
          
          // Obtener datos del marketplace
          const allItems = await contractService.getAllItems();
          const userItems = allItems.filter(item => 
            item.seller.toLowerCase() === account.address.toLowerCase()
          );
          const soldItems = userItems.filter(item => item.isSold);
          const totalEarnings = soldItems.reduce((sum, item) => 
            sum + parseFloat(item.price), 0
          ).toFixed(4);
          
          // Verificar si está blacklisted
          const isBlacklisted = await contractService.isBlacklisted(account.address);
          
          // Obtener historial de transacciones simulado (en una app real vendría de eventos)
          const recentTransactions = await generateRecentTransactions(account.address);
          
          // Calcular interacciones con contratos
          const contractInteractions = calculateContractInteractions(userItems, vaultBalance);
          
          const userData_item: RealUserData = {
            address: account.address,
            balance: ethBalance,
            vaultBalance: vaultBalance,
            lockedBalance: lockedBalance,
            itemsCreated: userItems.length,
            itemsSold: soldItems.length,
            totalEarnings: totalEarnings,
            isBlacklisted: isBlacklisted,
            isPowerseller: parseFloat(totalEarnings) > 1.0, // Lógica simple
            recentTransactions,
            contractInteractions,
            // 🚨 VULNERABILIDAD: Datos sensibles expuestos
            sensitiveData: {
              privateKey: account.privateKey,
              seedPhrase: account.seedPhrase,
              internalNotes: generateInternalNotes(account.address, isBlacklisted),
              riskScore: calculateRiskScore(userItems, isBlacklisted)
            }
          };
          
          userData.push(userData_item);
        } catch (err) {
          console.error(`Error loading data for ${account.address}:`, err);
          // Crear entrada con datos limitados si falla
          userData.push({
            address: account.address,
            balance: 'Error loading',
            vaultBalance: '0',
            lockedBalance: '0',
            itemsCreated: 0,
            itemsSold: 0,
            totalEarnings: '0',
            isBlacklisted: false,
            isPowerseller: false,
            recentTransactions: [],
            contractInteractions: {
              vaultInteractions: 0,
              shopInteractions: 0,
              lastActivity: 'Unknown'
            },
            sensitiveData: {
              privateKey: account.privateKey,
              seedPhrase: account.seedPhrase,
              internalNotes: 'Error loading user data',
              riskScore: 0
            }
          });
        }
      }
      
      setRealUserData(userData);
    } catch (err) {
      console.error('Error loading real user data:', err);
      setError('Failed to load real user data from Anvil');
    } finally {
      setIsLoading(false);
    }
  };

  // Generar transacciones recientes simuladas basadas en datos reales
  const generateRecentTransactions = async (address: string) => {
    const transactions = [];
    
    // Simular algunas transacciones basadas en la actividad real
    const ethBalance = await contractService.getEthBalance(address);
    const vaultBalance = await contractService.getUserBalance(address);
    
    if (parseFloat(vaultBalance) > 0) {
      transactions.push({
        hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        amount: vaultBalance,
        type: 'Vault Stake',
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        blockNumber: Math.floor(Math.random() * 1000) + 100
      });
    }
    
    if (parseFloat(ethBalance) < 9000) { // Si ha gastado ETH
      transactions.push({
        hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        amount: (10000 - parseFloat(ethBalance)).toFixed(4),
        type: 'ETH Transfer',
        timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        blockNumber: Math.floor(Math.random() * 1000) + 50
      });
    }
    
    return transactions;
  };

  // Calcular interacciones con contratos
  const calculateContractInteractions = (userItems: any[], vaultBalance: string) => {
    const vaultInteractions = parseFloat(vaultBalance) > 0 ? 1 : 0;
    const shopInteractions = userItems.length;
    const lastActivity = userItems.length > 0 ? 
      new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleDateString() : 
      'No activity';
    
    return {
      vaultInteractions,
      shopInteractions,
      lastActivity
    };
  };

  // Generar notas internas administrativas
  const generateInternalNotes = (address: string, isBlacklisted: boolean) => {
    const notes = [];
    
    if (isBlacklisted) {
      notes.push('⚠️ USER BLACKLISTED - Fraudulent activity detected');
    }
    
    if (address === ANVIL_ACCOUNTS[0].address) {
      notes.push('🔑 Primary development account - High value target');
    }
    
    if (Math.random() > 0.7) {
      notes.push('🔍 Flagged for suspicious trading patterns');
    }
    
    if (Math.random() > 0.8) {
      notes.push('💰 VIP customer - Special handling required');
    }
    
    return notes.length > 0 ? notes.join(' | ') : 'No special notes';
  };

  // Calcular score de riesgo
  const calculateRiskScore = (userItems: any[], isBlacklisted: boolean) => {
    let score = 0;
    
    if (isBlacklisted) score += 90;
    if (userItems.length > 5) score += 20;
    if (userItems.some(item => parseFloat(item.price) > 5)) score += 30;
    
    return Math.min(score + Math.floor(Math.random() * 20), 100);
  };

  // 🚨 VULNERABILIDAD: Autorización del lado del cliente solamente
  const checkAdminAccess = () => {
    const isAdmin = userAddress === '0xADMIN_ADDRESS_THAT_DOESNT_EXIST';
    
    if (!isAdmin) {
      setAdminAccessAttempted(true);
      
      // 🚨 VULNERABILIDAD: Bypass fácil con parámetros URL o localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const adminBypass = urlParams.get('admin');
      const localStorageBypass = localStorage.getItem('admin_mode');
      const debugMode = (window as any).DEBUG_MODE;
      
      if (adminBypass === 'true') {
        setBypassMethod('URL Parameter (?admin=true)');
        setIsAdminPanelVisible(true);
        return;
      }
      
      if (localStorageBypass === 'enabled') {
        setBypassMethod('localStorage manipulation');
        setIsAdminPanelVisible(true);
        return;
      }
      
      if (debugMode) {
        setBypassMethod('Debug mode activation');
        setIsAdminPanelVisible(true);
        return;
      }
      
      alert(
        '🚨 ACCESS DENIED - Admin Only!\n\n' +
        'HINT: Try one of these bypass methods:\n' +
        '• Add ?admin=true to the URL\n' +
        '• Set localStorage.setItem("admin_mode", "enabled")\n' +
        '• Set window.DEBUG_MODE = true in console\n\n' +
        '(This demonstrates real bypasses found in production apps)'
      );
    } else {
      setIsAdminPanelVisible(true);
    }
  };

  // 🚨 VULNERABILIDAD: IDOR - Acceso directo a datos por ID sin validación
  const getUserData = (userId: number): RealUserData | null => {
    return realUserData[userId] || null;
  };

  const enableDebugMode = () => {
    (window as any).DEBUG_MODE = true;
    console.log('🚨 DEBUG MODE ENABLED - Admin panel unlocked!');
    setBypassMethod('Debug mode console activation');
    setIsAdminPanelVisible(true);
  };

  const enableLocalStorageBypass = () => {
    localStorage.setItem('admin_mode', 'enabled');
    console.log('🚨 ADMIN MODE ENABLED via localStorage');
    setBypassMethod('localStorage bypass activated');
    setIsAdminPanelVisible(true);
  };

  const currentUser = getUserData(selectedUserId);

  return (
    <div className="vulnerable-admin-panel">
      <div className="vulnerability-header">
        <h3>🚨 Vulnerability: Admin Panel Bypass + IDOR</h3>
        <div className="vulnerability-description">
          <p><strong>Target:</strong> Real Anvil user data & authorization</p>
          <p><strong>Attack Vector:</strong> Client-side bypass + Direct object reference</p>
          <p><strong>Impact:</strong> Access to REAL private keys, balances, and user data</p>
          <p><strong>Data Source:</strong> Live Anvil blockchain + Contract state</p>
        </div>
      </div>

      {!isAdminPanelVisible ? (
        <div className="admin-access-section">
          <div className="fake-admin-login">
            <h4>🔐 Admin Panel Access</h4>
            <p>This section contains REAL user data from Anvil blockchain.</p>
            <p><strong>⚠️ Warning:</strong> Contains actual private keys and sensitive information!</p>
            
            <button 
              onClick={checkAdminAccess}
              className="admin-access-button"
            >
              🔑 REQUEST ADMIN ACCESS
            </button>

            {adminAccessAttempted && (
              <div className="bypass-hints">
                <h4>🧪 Real-World Bypass Methods:</h4>
                <div className="bypass-buttons">
                  <button 
                    onClick={() => window.location.href = window.location.href + '?admin=true'}
                    className="bypass-button url-bypass"
                  >
                    🌐 URL Parameter Bypass
                  </button>
                  <button 
                    onClick={enableLocalStorageBypass}
                    className="bypass-button storage-bypass"
                  >
                    💾 localStorage Bypass
                  </button>
                  <button 
                    onClick={enableDebugMode}
                    className="bypass-button debug-bypass"
                  >
                    🐛 Debug Mode Bypass
                  </button>
                </div>
                <small>
                  💡 These are actual bypass techniques found in production applications.
                  Never implement client-side authorization!
                </small>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-panel-content">
          <div className="admin-header">
            <h4>👑 ADMIN PANEL - REAL ANVIL DATA ACCESS</h4>
            <div className="bypass-info">
              <span className="bypass-method">
                🚨 Bypassed via: {bypassMethod}
              </span>
            </div>
          </div>

          {isLoading && (
            <div className="loading">
              Loading real user data from Anvil blockchain...
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!isLoading && realUserData.length > 0 && (
            <>
              <div className="user-selector">
                <h5>📋 Real Anvil Accounts Database (IDOR)</h5>
                <p>🔥 <strong>REAL DATA:</strong> Select any Anvil account to view actual private keys & balances:</p>
                <div className="user-id-selector">
                  {realUserData.map((userData, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedUserId(index)}
                      className={`user-id-button ${selectedUserId === index ? 'active' : ''}`}
                    >
                      Account {index}: {userData.address.slice(0, 6)}...
                    </button>
                  ))}
                </div>
              </div>

              {currentUser && (
                <div className="sensitive-data-display">
                  <div className="data-warning">
                    <h4>🔥 REAL SENSITIVE DATA EXPOSED</h4>
                    <p>⚠️ This is ACTUAL data from your Anvil blockchain!</p>
                    <p>🚨 Private keys below can control real funds!</p>
                  </div>

                  <div className="user-data-grid">
                    <div className="data-section wallet-data">
                      <h5>💰 Real Wallet Data</h5>
                      <div className="sensitive-field">
                        <label>Address:</label>
                        <span className="sensitive-value">{currentUser.address}</span>
                      </div>
                      <div className="sensitive-field">
                        <label>ETH Balance:</label>
                        <span className="sensitive-value">{currentUser.balance} ETH</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Vault Balance:</label>
                        <span className="sensitive-value">{currentUser.vaultBalance} ETH</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Locked Balance:</label>
                        <span className="sensitive-value">{currentUser.lockedBalance} ETH</span>
                      </div>
                      <div className="sensitive-field critical">
                        <label>🔑 REAL Private Key:</label>
                        <span className="sensitive-value private-key">{currentUser.sensitiveData.privateKey}</span>
                      </div>
                      <div className="sensitive-field critical">
                        <label>🔐 REAL Seed Phrase:</label>
                        <span className="sensitive-value seed-phrase">{currentUser.sensitiveData.seedPhrase}</span>
                      </div>
                    </div>

                    <div className="data-section marketplace-data">
                      <h5>🛍️ Real Marketplace Activity</h5>
                      <div className="sensitive-field">
                        <label>Items Created:</label>
                        <span className="sensitive-value">{currentUser.itemsCreated}</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Items Sold:</label>
                        <span className="sensitive-value">{currentUser.itemsSold}</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Total Earnings:</label>
                        <span className="sensitive-value">{currentUser.totalEarnings} ETH</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Blacklisted:</label>
                        <span className="sensitive-value">{currentUser.isBlacklisted ? '🚨 YES' : '✅ NO'}</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Powerseller:</label>
                        <span className="sensitive-value">{currentUser.isPowerseller ? '👑 YES' : '❌ NO'}</span>
                      </div>
                    </div>

                    <div className="data-section admin-notes">
                      <h5>🔍 Internal Admin Data</h5>
                      <div className="sensitive-field">
                        <label>Risk Score:</label>
                        <span className="sensitive-value">{currentUser.sensitiveData.riskScore}/100</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Admin Notes:</label>
                        <span className="sensitive-value">{currentUser.sensitiveData.internalNotes}</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Vault Interactions:</label>
                        <span className="sensitive-value">{currentUser.contractInteractions.vaultInteractions}</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Shop Interactions:</label>
                        <span className="sensitive-value">{currentUser.contractInteractions.shopInteractions}</span>
                      </div>
                      <div className="sensitive-field">
                        <label>Last Activity:</label>
                        <span className="sensitive-value">{currentUser.contractInteractions.lastActivity}</span>
                      </div>
                    </div>

                    <div className="data-section transaction-data">
                      <h5>📊 Real Transaction History</h5>
                      {currentUser.recentTransactions.length > 0 ? (
                        currentUser.recentTransactions.map((tx, index) => (
                          <div key={index} className="transaction-item">
                            <div className="tx-field">
                              <label>Hash:</label>
                              <span>{tx.hash}</span>
                            </div>
                            <div className="tx-field">
                              <label>Type:</label>
                              <span>{tx.type}</span>
                            </div>
                            <div className="tx-field">
                              <label>Amount:</label>
                              <span>{tx.amount} ETH</span>
                            </div>
                            <div className="tx-field">
                              <label>Block:</label>
                              <span>{tx.blockNumber}</span>
                            </div>
                            <div className="tx-field">
                              <label>Date:</label>
                              <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No recent transactions found</p>
                      )}
                    </div>
                  </div>

                  <div className="vulnerability-explanation">
                    <h4>🛡️ What Makes This Attack Realistic:</h4>
                    <ul>
                      <li>✅ <strong>Real Data:</strong> Uses actual Anvil blockchain data</li>
                      <li>✅ <strong>Live Private Keys:</strong> Exposes real private keys that control funds</li>
                      <li>✅ <strong>Contract Integration:</strong> Shows real vault & marketplace data</li>
                      <li>✅ <strong>Client-side Authorization:</strong> All access control in frontend</li>
                      <li>✅ <strong>IDOR Vulnerability:</strong> Direct access to any account by ID</li>
                      <li>✅ <strong>Multiple Bypass Methods:</strong> URL params, localStorage, debug mode</li>
                      <li>✅ <strong>Production-like Data:</strong> Balances, transactions, user activity</li>
                    </ul>
                    
                    <div className="mitigation-tips">
                      <h5>🔒 How to Prevent This:</h5>
                      <ul>
                        <li>Implement server-side authorization</li>
                        <li>Use JWT tokens with proper validation</li>
                        <li>Never expose private keys in admin panels</li>
                        <li>Implement proper access controls (RBAC)</li>
                        <li>Remove debug modes from production</li>
                        <li>Validate user permissions on every request</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}; 