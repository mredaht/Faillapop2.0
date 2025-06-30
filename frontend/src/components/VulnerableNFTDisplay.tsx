import React, { useState, useEffect } from 'react';
import { ContractService } from '../services/ContractService';

interface VulnerableNFTDisplayProps {
  contractService: ContractService;
  userAddress: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: any[];
}

// Función para crear página de phishing simulada
const createPhishingPage = () => {
  return `
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
          <strong>You've been redirected to a FAKE phishing site!</strong><br><br>
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
};

// 🚨 VULNERABILIDAD: XSS en tokenURI
// Este componente renderiza metadatos de NFT sin sanitización, permitiendo XSS
export const VulnerableNFTDisplay: React.FC<VulnerableNFTDisplayProps> = ({ 
  contractService, 
  userAddress 
}) => {
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Metadatos maliciosos simulados (en un ataque real vendrían del tokenURI)
  const maliciousNFTData: NFTMetadata[] = [
    {
      name: "Cool Faillapop NFT #1",
      description: "A legitimate looking NFT with hidden XSS",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmNmI2YiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+TkZUIzE8L3RleHQ+PC9zdmc+"
    },
    {
      name: "Powerseller Badge",
      description: `Congratulations on becoming a Powerseller! <img src="x" onerror="alert('🚨 XSS ATTACK: Your wallet could be compromised! This NFT metadata contains malicious JavaScript.')" />`,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZDcwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJibGFjayIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+QmFkZ2U8L3RleHQ+PC9zdmc+"
    },
    {
      name: `Special Reward <script>
        console.log('🚨 XSS EJECUTADO: Script malicioso en tokenURI');
        console.log('En un ataque real esto podría:');
        console.log('- Robar cookies/localStorage');
        console.log('- Realizar transacciones no autorizadas');
        console.log('- Redirigir a sitios de phishing');
        setTimeout(() => {
          alert('🚨 XSS Attack Simulated: Malicious script executed from NFT metadata!');
        }, 1000);
      </script>`,
      description: "This NFT contains malicious JavaScript in its name",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U3NGMzYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+REFOR0VSPC90ZXh0Pjwvc3ZnPg=="
    },
    {
      name: "Anniversary NFT",
      description: `Thanks for being part of Faillapop! <iframe src="javascript:alert('XSS via iframe in NFT description')" style="display:none"></iframe>`,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzliNTliNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+QW5uaXZlcnNhcnk8L3RleHQ+PC9zdmc+"
    },
    {
            name: `🎁 EXCLUSIVE AIRDROP NFT 🎁 <script>
        console.log('🚨 XSS PHISHING ATTACK INITIATED');
        console.log('📧 Simulating phishing redirect...');
        
        setTimeout(function() {
          var shouldRedirect = confirm(
            '🎉 CONGRATULATIONS! You won an EXCLUSIVE AIRDROP!' + String.fromCharCode(10) + String.fromCharCode(10) +
            '💰 Claim 10,000 FREE FAIL tokens now!' + String.fromCharCode(10) +
            '⏰ Limited time offer - expires in 5 minutes' + String.fromCharCode(10) + String.fromCharCode(10) +
            '🔗 Click OK to claim your tokens on our secure portal' + String.fromCharCode(10) +
            '(This is a PHISHING SIMULATION - Click OK to see the redirect)'
          );
          if (shouldRedirect) {
            console.log('🚨 REDIRECTING TO PHISHING SITE...');
            console.log('🎯 In a real attack, this would steal your wallet credentials');
            
            var phishingHTML = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif; margin: 0; padding: 0;"><div style="background: white; border-radius: 20px; padding: 3rem; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; max-width: 500px; width: 90%;"><div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div><h1 style="color: #333; margin-bottom: 1rem; font-size: 2rem;">EXCLUSIVE AIRDROP!</h1><div style="background: #ff6b6b; color: white; padding: 1rem; border-radius: 10px; margin: 1rem 0; font-weight: bold; font-size: 1.2rem;">🚨 PHISHING SIMULATION ACTIVE 🚨</div><p style="color: #666; margin-bottom: 2rem; line-height: 1.6;"><strong>You have been redirected to a FAKE phishing site!</strong><br><br>In a real attack, this page would:</p><ul style="text-align: left; color: #333; margin-bottom: 2rem;"><li>🎯 Steal your wallet seed phrase</li><li>💳 Capture your private keys</li><li>🔐 Drain your cryptocurrency</li><li>📧 Harvest personal information</li><li>🦠 Install malware on your device</li></ul><div style="background: #f8f9fa; border: 2px dashed #dee2e6; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;"><h3 style="color: #495057; margin-bottom: 1rem;">🛡️ How to Protect Yourself:</h3><ul style="text-align: left; color: #6c757d; font-size: 0.9rem;"><li>✅ Always verify URLs before entering sensitive info</li><li>✅ Use bookmarks for important crypto sites</li><li>✅ Enable 2FA on all accounts</li><li>✅ Never share your seed phrase</li><li>✅ Be suspicious of too good to be true offers</li></ul></div><button onclick="location.reload()" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 1rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; margin-top: 1rem;">🔄 Return to Safety</button></div></div>';
            
            document.body.innerHTML = phishingHTML;
          }
        }, 2000);
      </script>`,
      description: "🚨 This NFT contains a phishing redirect attack! Click to see the simulation.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBoaXNoaW5nIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY0NDQ0O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmODg4ODtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNwaGlzaGluZykiLz48dGV4dCB4PSI1MCUiIHk9IjQwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPvCfkoI8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5QSElTSElORzwvdGV4dD48L3N2Zz4="
    }
  ];

  const loadNFTs = async () => {
    setIsLoading(true);
    try {
      // Simular carga de NFTs con delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNftMetadata(maliciousNFTData);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) {
      loadNFTs();
    }
    
    // Hacer la función de phishing disponible globalmente para el XSS
    (window as any).createPhishingPage = createPhishingPage;
    
    return () => {
      // Limpiar al desmontar el componente
      delete (window as any).createPhishingPage;
    };
  }, [userAddress]);

  if (isLoading) {
    return <div className="loading">Loading your NFTs...</div>;
  }

  return (
    <div className="vulnerable-nft-display">
      <div className="nft-header">
        <h3>🖼️ Your NFT Collection</h3>
        <p>Displaying NFTs with metadata from tokenURI</p>
      </div>
      
      <div className="nft-grid">
        {nftMetadata.map((nft, index) => (
          <div key={index} className={`nft-card ${index === 4 ? 'phishing-nft' : ''}`}>
            <img 
              src={nft.image} 
              alt={nft.name}
              className="nft-image"
            />
            <div className="nft-info">
              {/* 🚨 VULNERABILIDAD: Renderizado directo sin sanitización */}
              <h4 
                className="nft-name"
                dangerouslySetInnerHTML={{ __html: nft.name }}
              />
              <div 
                className="nft-description"
                dangerouslySetInnerHTML={{ __html: nft.description }}
              />
              {index === 4 && (
                <div className="phishing-warning">
                  ⚠️ This NFT will trigger a phishing redirect simulation!
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Información educativa sobre la vulnerabilidad */}
      <div className="vulnerability-info">
        <h4>🚨 Security Warning: XSS Vulnerability Demonstrated</h4>
        <p>
          This component demonstrates how NFT metadata can contain malicious JavaScript 
          that gets executed when rendered without proper sanitization.
        </p>
        <ul>
          <li>NFT names and descriptions are rendered using dangerouslySetInnerHTML</li>
          <li>Malicious tokenURI data can execute arbitrary JavaScript</li>
          <li>This could lead to wallet drainage, cookie theft, or phishing redirects</li>
          <li><strong>NEW:</strong> The 5th NFT demonstrates a phishing redirect attack!</li>
        </ul>
        <p><strong>Mitigation:</strong> Always sanitize user-provided content before rendering!</p>
      </div>
    </div>
  );
}; 