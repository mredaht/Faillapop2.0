# 🚨 Security Vulnerabilities Demo - Faillapop 2.0

## ⚠️ ADVERTENCIA EDUCATIVA

Este proyecto contiene **vulnerabilidades de seguridad implementadas intencionalmente** con fines educativos y de auditoría de seguridad Web3. **NUNCA** implementes estas vulnerabilidades en aplicaciones de producción.

---

## 📋 VULNERABILIDADES IMPLEMENTADAS

### 1. **UI Spoofing + Approve Phishing** 
**📁 Archivo:** `frontend/src/components/MaliciousApproveButton.tsx`  
**🎯 Contratos afectados:** Shop.sol, Vault.sol, Token.sol

#### 🔍 **Descripción del Ataque**
- **Técnica**: Interfaz de usuario engañosa que simula un "bonus" o "airdrop"
- **Objetivo**: Hacer que el usuario apruebe gastado de tokens sin darse cuenta
- **Vector**: Botón que aparenta ser legítimo pero ejecuta `approve()` malicioso

#### 🛠️ **Cómo Funciona**
1. Se presenta un botón atractivo: "🎁 CLAIM FREE TOKENS"
2. El usuario cree que está reclamando tokens gratis
3. En realidad, se ejecuta `tokenContract.approve(MALICIOUS_SPENDER, MaxUint256)`
4. El atacante obtiene permiso para gastar TODOS los tokens del usuario

#### 📊 **Implementación Técnica**
```typescript
// 🚨 VULNERABILIDAD: Approve malicioso disfrazado
const tokenContract = new ethers.Contract(FAILLAPOP_TOKEN_ADDRESS, ABI, signer);
await tokenContract.approve(MALICIOUS_SPENDER, ethers.constants.MaxUint256);
```

#### 🛡️ **Mitigaciones**
- **Usuarios**: Siempre revisar qué permisos se están otorgando antes de firmar
- **Developers**: Implementar advertencias claras sobre approvals
- **Wallets**: Mejorar UX para mostrar claramente qué se está aprobando

---

### 2. **XSS en tokenURI (Cross-Site Scripting)**
**📁 Archivo:** `frontend/src/components/VulnerableNFTDisplay.tsx`  
**🎯 Contratos afectados:** CoolNFT.sol, PowersellerNFT.sol

#### 🔍 **Descripción del Ataque**
- **Técnica**: Inyección de JavaScript malicioso en metadatos de NFT
- **Objetivo**: Ejecutar código arbitrario en el navegador del usuario
- **Vector**: Metadatos del NFT sin sanitización renderizados con `dangerouslySetInnerHTML`

#### 🛠️ **Cómo Funciona**
1. Un atacante crea un NFT con metadatos maliciosos en `tokenURI`
2. Los metadatos contienen JavaScript en el `name` o `description`
3. La aplicación renderiza estos datos sin sanitización
4. El script se ejecuta automáticamente cuando se visualiza el NFT

#### 📊 **Implementación Técnica**
```typescript
// 🚨 VULNERABILIDAD: Renderizado sin sanitización
<h4 
  className="nft-name"
  dangerouslySetInnerHTML={{ __html: nft.name }}
/>
<div 
  className="nft-description"
  dangerouslySetInnerHTML={{ __html: nft.description }}
/>
```

#### 💀 **Ejemplos de Payloads Maliciosos**
```javascript
// En el nombre del NFT:
"Cool NFT <script>alert('XSS Attack!')</script>"

// En la descripción:
"Beautiful art <img src='x' onerror='stealTokens()'/>"

// Iframe malicioso:
"Amazing NFT <iframe src='javascript:maliciousFunction()'></iframe>"

// 🆕 PHISHING REDIRECT:
"🎁 AIRDROP <script>
  setTimeout(() => {
    if(confirm('Claim FREE tokens?')) {
      document.body.innerHTML = createPhishingPage();
    }
  }, 2000);
</script>"
```

#### 🛡️ **Mitigaciones**
- **Sanitización**: Usar librerías como DOMPurify
- **CSP**: Implementar Content Security Policy estricta
- **Validación**: Validar metadatos en el backend
- **Escape**: Escapar HTML antes de renderizar

---

## 🚀 **CÓMO PROBAR LAS VULNERABILIDADES**

### 🔧 **Ejecutar la Demo**
1. **Iniciar el frontend:**
   ```bash
   cd frontend
   npm start
   ```

2. **Navegar a la pestaña "🚨 Security Demo"**

3. **Probar UI Spoofing:**
   - Hacer clic en "🎁 CLAIM FREE TOKENS"
   - Observar los logs en la consola del navegador
   - Ver el alert explicativo sobre el ataque

4. **Probar XSS en NFTs:**
   - Los NFTs se cargan automáticamente con metadatos maliciosos
   - Observar los alerts de XSS que se ejecutan
   - Revisar la consola para logs maliciosos
   - **🆕 NUEVO:** El 5º NFT (con borde rojo pulsante) ejecuta un ataque de phishing redirect

### 📝 **Logs de Seguridad**
La demo genera logs educativos en la consola:
```
🚨 ATAQUE REAL DETECTADO:
Token contract: 0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44
User balance: 0.0 FAIL tokens
Malicious spender: 0x000000000000000000000000000000000000dEaD

🚨 XSS EJECUTADO: Script malicioso en tokenURI
En un ataque real esto podría:
- Robar cookies/localStorage
- Realizar transacciones no autorizadas
- Redirigir a sitios de phishing

🚨 XSS PHISHING ATTACK INITIATED
📧 Simulating phishing redirect...
🚨 REDIRECTING TO PHISHING SITE...
🎯 In a real attack, this would steal your wallet credentials
```

---

## 🛡️ **MEDIDAS DE SEGURIDAD RECOMENDADAS**

### **Para Desarrolladores**
1. **Input Sanitization**: Sanitizar TODOS los inputs del usuario
2. **Content Security Policy**: Implementar CSP restrictiva
3. **Approval Warnings**: Mostrar advertencias claras en approvals
4. **Gas Estimation**: Validar transacciones antes de enviarlas
5. **Rate Limiting**: Implementar límites de rate en acciones críticas

### **Para Usuarios**
1. **Verificar Transacciones**: Siempre revisar qué se está firmando
2. **Wallets Confiables**: Usar wallets que muestren detalles claros
3. **Desconfiar de "Free"**: Ser escéptico de ofertas "gratis"
4. **Revisar Approvals**: Verificar qué permisos se están otorgando
5. **Actualizar Software**: Mantener wallets y navegadores actualizados

---

## 📚 **RECURSOS ADICIONALES**

### **Frameworks de Seguridad Web3**
- [OpenZeppelin Security Best Practices](https://docs.openzeppelin.com/learn/preparing-for-mainnet)
- [ConsenSys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OWASP Web3 Security](https://owasp.org/www-project-smart-contract-top-10/)

### **Herramientas de Auditoría**
- [Slither](https://github.com/crytic/slither) - Análisis estático de contratos
- [MythX](https://mythx.io/) - Plataforma de análisis de seguridad
- [Securify](https://securify.chainsecurity.com/) - Scanner de vulnerabilidades

---

## ⚖️ **DESCARGO DE RESPONSABILIDAD**

Este código se proporciona **únicamente con fines educativos**. Los autores no se hacen responsables del uso indebido de estas vulnerabilidades. Utiliza este conocimiento de manera ética para:

- ✅ Aprender sobre seguridad en Web3
- ✅ Realizar auditorías de seguridad legítimas  
- ✅ Mejorar la seguridad de tus aplicaciones
- ❌ **NO** para atacar o comprometer sistemas ajenos

---

**🔐 "La mejor defensa es conocer el ataque"** 