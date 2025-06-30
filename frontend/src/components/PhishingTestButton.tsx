import React from 'react';

// 🚨 COMPONENTE DE PRUEBA DIRECTA PARA PHISHING
// Este botón ejecuta directamente el ataque de phishing para facilitar las pruebas
export const PhishingTestButton: React.FC = () => {
  
  const executePhishingAttack = () => {
    console.log('🚨 PHISHING TEST BUTTON CLICKED');
    console.log('🎯 Executing direct phishing simulation...');
    
    const shouldRedirect = window.confirm(
      '🎉 CONGRATULATIONS! You won an EXCLUSIVE AIRDROP!\n\n' +
      '💰 Claim 10,000 FREE FAIL tokens now!\n' +
      '⏰ Limited time offer - expires in 5 minutes\n\n' +
      '🔗 Click OK to claim your tokens on our secure portal\n' +
      '(This is a PHISHING SIMULATION - Click OK to see the redirect)'
    );
    
    if (shouldRedirect) {
      console.log('🚨 REDIRECTING TO PHISHING SITE...');
      console.log('🎯 In a real attack, this would steal your wallet credentials');
      
      const phishingHTML = `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        ">
          <div style="
            background: white;
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
          ">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <h1 style="color: #333; margin-bottom: 1rem; font-size: 2rem;">
              EXCLUSIVE AIRDROP!
            </h1>
            <div style="
              background: #ff6b6b;
              color: white;
              padding: 1rem;
              border-radius: 10px;
              margin: 1rem 0;
              font-weight: bold;
              font-size: 1.2rem;
            ">
              🚨 PHISHING SIMULATION ACTIVE 🚨
            </div>
            <p style="color: #666; margin-bottom: 2rem; line-height: 1.6;">
              <strong>You have been redirected to a FAKE phishing site!</strong><br><br>
              In a real attack, this page would:
            </p>
            <ul style="text-align: left; color: #333; margin-bottom: 2rem;">
              <li>🎯 Steal your wallet seed phrase</li>
              <li>💳 Capture your private keys</li>
              <li>🔐 Drain your cryptocurrency</li>
              <li>📧 Harvest personal information</li>
              <li>🦠 Install malware on your device</li>
            </ul>
            <div style="
              background: #f8f9fa;
              border: 2px dashed #dee2e6;
              padding: 1.5rem;
              border-radius: 10px;
              margin: 1rem 0;
            ">
              <h3 style="color: #495057; margin-bottom: 1rem;">
                🛡️ How to Protect Yourself:
              </h3>
              <ul style="text-align: left; color: #6c757d; font-size: 0.9rem;">
                <li>✅ Always verify URLs before entering sensitive info</li>
                <li>✅ Use bookmarks for important crypto sites</li>
                <li>✅ Enable 2FA on all accounts</li>
                <li>✅ Never share your seed phrase</li>
                <li>✅ Be suspicious of "too good to be true" offers</li>
              </ul>
            </div>
            <button onclick="location.reload()" style="
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              border: none;
              padding: 1rem 2rem;
              border-radius: 50px;
              font-size: 1.1rem;
              font-weight: bold;
              cursor: pointer;
              margin-top: 1rem;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              🔄 Return to Safety
            </button>
          </div>
        </div>
      `;
      
      // Reemplazar toda la página con el contenido de phishing
      document.body.innerHTML = phishingHTML;
    }
  };

  return (
    <div className="phishing-test-section">
      <h3>🧪 Direct Phishing Test</h3>
      <p>Click the button below to test the phishing redirect directly (bypasses XSS):</p>
      <button 
        onClick={executePhishingAttack}
        className="phishing-test-button"
      >
        🎯 TEST PHISHING REDIRECT
      </button>
      <small>
        This button simulates what would happen if the XSS attack in the NFT succeeded.
      </small>
    </div>
  );
}; 