import React, { useState } from 'react';

interface VulnerableAdminPanelProps {
  contractService: any;
  userAddress: string;
}

interface UserData {
  address: string;
  balance: string;
  privateKey: string;
  seedPhrase: string;
  transactionHistory: Array<{
    hash: string;
    amount: string;
    to: string;
    timestamp: string;
  }>;
  personalInfo: {
    email: string;
    phone: string;
    location: string;
  };
}

// 🚨 VULNERABILIDAD: Datos sensibles hardcodeados en el frontend
const FAKE_ADMIN_USERS = [
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    balance: '10000.0 ETH',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    seedPhrase: 'test test test test test test test test test test test junk',
    transactionHistory: [
      { hash: '0x1234...', amount: '1.5 ETH', to: '0xabc...', timestamp: '2024-01-15' },
      { hash: '0x5678...', amount: '0.8 ETH', to: '0xdef...', timestamp: '2024-01-14' }
    ],
    personalInfo: {
      email: 'admin@faillapop.com',
      phone: '+1-555-0123',
      location: 'New York, USA'
    }
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    balance: '5000.0 ETH',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    seedPhrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    transactionHistory: [
      { hash: '0x9abc...', amount: '2.1 ETH', to: '0x123...', timestamp: '2024-01-13' }
    ],
    personalInfo: {
      email: 'user2@example.com',
      phone: '+1-555-0456',
      location: 'Los Angeles, USA'
    }
  },
  {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    balance: '7500.0 ETH',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    seedPhrase: 'quality vacuum heart guard buzz spike sight swarm shove special gym robust assume',
    transactionHistory: [
      { hash: '0xdef1...', amount: '0.5 ETH', to: '0x789...', timestamp: '2024-01-12' },
      { hash: '0xdef2...', amount: '3.2 ETH', to: '0x456...', timestamp: '2024-01-11' }
    ],
    personalInfo: {
      email: 'trader@crypto.com',
      phone: '+1-555-0789',
      location: 'Miami, USA'
    }
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

  // 🚨 VULNERABILIDAD: Autorización del lado del cliente solamente
  const checkAdminAccess = () => {
    // Simulación de verificación débil
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
      
      // 🚨 VULNERABILIDAD: Mensaje que revela métodos de bypass
      alert(
        '🚨 ACCESS DENIED - Admin Only!\n\n' +
        'HINT: Try one of these bypass methods:\n' +
        '• Add ?admin=true to the URL\n' +
        '• Set localStorage.setItem("admin_mode", "enabled")\n' +
        '• Set window.DEBUG_MODE = true in console\n\n' +
        '(This is a security vulnerability demonstration)'
      );
    } else {
      setIsAdminPanelVisible(true);
    }
  };

  // 🚨 VULNERABILIDAD: IDOR - Acceso directo a datos por ID sin validación
  const getUserData = (userId: number): UserData | null => {
    // Sin validación de permisos - cualquiera puede acceder a cualquier usuario
    return FAKE_ADMIN_USERS[userId] || null;
  };

  const enableDebugMode = () => {
    (window as any).DEBUG_MODE = true;
    console.log('🚨 DEBUG MODE ENABLED - Admin panel unlocked!');
    console.log('🎯 This simulates a debug mode left in production');
    setBypassMethod('Debug mode console activation');
    setIsAdminPanelVisible(true);
  };

  const enableLocalStorageBypass = () => {
    localStorage.setItem('admin_mode', 'enabled');
    console.log('🚨 ADMIN MODE ENABLED via localStorage');
    console.log('🎯 This simulates client-side authorization bypass');
    setBypassMethod('localStorage bypass activated');
    setIsAdminPanelVisible(true);
  };

  const currentUser = getUserData(selectedUserId);

  return (
    <div className="vulnerable-admin-panel">
      <div className="vulnerability-header">
        <h3>🚨 Vulnerability 3: Admin Panel Bypass + IDOR</h3>
        <div className="vulnerability-description">
          <p><strong>Target:</strong> Client-side authorization & data access</p>
          <p><strong>Attack Vector:</strong> Authorization bypass + Direct object reference</p>
          <p><strong>Impact:</strong> Unauthorized access to sensitive user data</p>
        </div>
      </div>

      {!isAdminPanelVisible ? (
        <div className="admin-access-section">
          <div className="fake-admin-login">
            <h4>🔐 Admin Panel Access</h4>
            <p>This section is restricted to administrators only.</p>
            
            <button 
              onClick={checkAdminAccess}
              className="admin-access-button"
            >
              🔑 REQUEST ADMIN ACCESS
            </button>

            {adminAccessAttempted && (
              <div className="bypass-hints">
                <h4>🧪 Bypass Methods (For Testing):</h4>
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
                  💡 In a real attack, these bypasses would be discovered through 
                  code inspection or developer tools analysis.
                </small>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-panel-content">
          <div className="admin-header">
            <h4>👑 ADMIN PANEL - UNAUTHORIZED ACCESS</h4>
            <div className="bypass-info">
              <span className="bypass-method">
                🚨 Bypassed via: {bypassMethod}
              </span>
            </div>
          </div>

          <div className="user-selector">
            <h5>📋 User Database (IDOR Vulnerability)</h5>
            <p>Select any user ID to view their private data:</p>
            <div className="user-id-selector">
              {FAKE_ADMIN_USERS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedUserId(index)}
                  className={`user-id-button ${selectedUserId === index ? 'active' : ''}`}
                >
                  User ID: {index}
                </button>
              ))}
            </div>
          </div>

          {currentUser && (
            <div className="sensitive-data-display">
              <div className="data-warning">
                <h4>🚨 SENSITIVE DATA EXPOSED</h4>
                <p>This data should NEVER be accessible to unauthorized users!</p>
              </div>

              <div className="user-data-grid">
                <div className="data-section wallet-data">
                  <h5>💰 Wallet Information</h5>
                  <div className="sensitive-field">
                    <label>Address:</label>
                    <span className="sensitive-value">{currentUser.address}</span>
                  </div>
                  <div className="sensitive-field">
                    <label>Balance:</label>
                    <span className="sensitive-value">{currentUser.balance}</span>
                  </div>
                  <div className="sensitive-field critical">
                    <label>🔑 Private Key:</label>
                    <span className="sensitive-value private-key">{currentUser.privateKey}</span>
                  </div>
                  <div className="sensitive-field critical">
                    <label>🔐 Seed Phrase:</label>
                    <span className="sensitive-value seed-phrase">{currentUser.seedPhrase}</span>
                  </div>
                </div>

                <div className="data-section personal-data">
                  <h5>👤 Personal Information</h5>
                  <div className="sensitive-field">
                    <label>📧 Email:</label>
                    <span className="sensitive-value">{currentUser.personalInfo.email}</span>
                  </div>
                  <div className="sensitive-field">
                    <label>📱 Phone:</label>
                    <span className="sensitive-value">{currentUser.personalInfo.phone}</span>
                  </div>
                  <div className="sensitive-field">
                    <label>📍 Location:</label>
                    <span className="sensitive-value">{currentUser.personalInfo.location}</span>
                  </div>
                </div>

                <div className="data-section transaction-data">
                  <h5>📊 Transaction History</h5>
                  {currentUser.transactionHistory.map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="tx-field">
                        <label>Hash:</label>
                        <span>{tx.hash}</span>
                      </div>
                      <div className="tx-field">
                        <label>Amount:</label>
                        <span>{tx.amount}</span>
                      </div>
                      <div className="tx-field">
                        <label>To:</label>
                        <span>{tx.to}</span>
                      </div>
                      <div className="tx-field">
                        <label>Date:</label>
                        <span>{tx.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="vulnerability-explanation">
                <h4>🛡️ How This Attack Works:</h4>
                <ul>
                  <li>✅ <strong>Client-side Authorization:</strong> Access control only in frontend</li>
                  <li>✅ <strong>URL Parameter Bypass:</strong> ?admin=true grants access</li>
                  <li>✅ <strong>localStorage Manipulation:</strong> Browser storage bypass</li>
                  <li>✅ <strong>Debug Mode:</strong> Development code left in production</li>
                  <li>✅ <strong>IDOR:</strong> Direct access to any user's data by ID</li>
                  <li>✅ <strong>Sensitive Data Exposure:</strong> Private keys and personal info visible</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 