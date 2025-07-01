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

### 3. **Admin Panel Bypass + IDOR (Insecure Direct Object Reference)**
**📁 Archivo:** `frontend/src/components/VulnerableAdminPanel.tsx`  
**🎯 Contratos afectados:** Frontend authorization system, user data access

#### 🔍 **Descripción del Ataque**
- **Técnica**: Bypass de autorización del lado del cliente + acceso directo a objetos
- **Objetivo**: Acceder a panel de administración y datos sensibles de usuarios
- **Vector**: Autorización implementada solo en frontend + acceso directo por ID

#### 🛠️ **Cómo Funciona**
1. La aplicación implementa autorización solo en el frontend (JavaScript)
2. Múltiples métodos de bypass disponibles (URL, localStorage, debug mode)
3. Una vez dentro, acceso directo a datos de cualquier usuario por ID
4. Exposición de información crítica: private keys, seed phrases, datos personales

#### 📊 **Implementación Técnica**
```typescript
// 🚨 VULNERABILIDAD: Autorización solo del lado del cliente
const checkAdminAccess = () => {
  const isAdmin = userAddress === '0xADMIN_ADDRESS_THAT_DOESNT_EXIST';
  
  // Bypass methods:
  const adminBypass = urlParams.get('admin') === 'true';
  const localStorageBypass = localStorage.getItem('admin_mode') === 'enabled';
  const debugMode = (window as any).DEBUG_MODE;
  
  if (adminBypass || localStorageBypass || debugMode) {
    setIsAdminPanelVisible(true); // ¡Acceso otorgado!
  }
};

// 🚨 VULNERABILIDAD: IDOR - Sin validación de permisos
const getUserData = (userId: number) => {
  return FAKE_ADMIN_USERS[userId]; // Acceso directo por ID
};
```

#### 💀 **Métodos de Bypass**
```javascript
// Método 1: Parámetro URL
window.location.href = window.location.href + '?admin=true';

// Método 2: localStorage
localStorage.setItem('admin_mode', 'enabled');

// Método 3: Debug Mode
window.DEBUG_MODE = true;

// Método 4: IDOR Attack
// Una vez dentro, acceso a cualquier usuario:
getUserData(0); // Datos del usuario ID 0
getUserData(1); // Datos del usuario ID 1
getUserData(2); // Datos del usuario ID 2
```

#### 🔓 **Datos Sensibles Expuestos**
- 🔑 **Private Keys**: Acceso completo a wallets
- 🔐 **Seed Phrases**: Recuperación de wallets  
- 📧 **Emails**: Direcciones de correo electrónico
- 📱 **Teléfonos**: Números de contacto
- 📍 **Ubicaciones**: Direcciones físicas
- 💰 **Balances**: Saldos de criptomonedas
- 📊 **Historial**: Transacciones completas

#### 🛡️ **Mitigaciones**
- **Autorización Backend**: Implementar control de acceso en el servidor
- **JWT Tokens**: Usar tokens seguros validados por el servidor
- **RBAC**: Control de acceso basado en roles
- **API Security**: Validar permisos en cada llamada API
- **Remover Debug**: Nunca dejar código de desarrollo en producción

---

### 4. **Purchase Manipulation + Race Condition (Integrado en Marketplace)**
**📁 Archivo:** `frontend/src/components/ItemDetails.tsx` (Modo Security Demo)  
**🎯 Contratos afectados:** Purchase process, transaction validation

#### 🔍 **Descripción del Ataque**
- **Técnica**: Manipulación de precios + condiciones de carrera integradas en el flujo de compra
- **Objetivo**: Comprar items a precios manipulados o explotar timing de transacciones
- **Vector**: Interfaz de compra vulnerable disponible en el marketplace de demostración

#### 🛠️ **Cómo Acceder**
1. Ir al tab "🚨 Security Demo"
2. Buscar la sección "🛒 Vulnerable Marketplace Item"
3. Hacer clic en el item con borde rojo
4. Activar "Enable Vulnerability Mode" en el modal
5. Seleccionar tipo de ataque y ejecutar

#### 🛠️ **Cómo Funciona**
1. **Price Manipulation**: Modificar precio en el frontend antes de enviar transacción
2. **Race Condition**: Enviar múltiples transacciones simultáneamente
3. **Client-side Validation Bypass**: Saltar validaciones del frontend

#### 📊 **Implementación Técnica**
```typescript
// 🚨 VULNERABILIDAD: Race Condition integrada
if (raceConditionActive) {
  console.log('⚡ Launching race condition attack...');
  const promises = [];
  
  for (let i = 0; i < 3; i++) {
    promises.push(
      contractService.buyItem(item.id, priceManipulation ? manipulatedPrice : item.price)
    );
  }
  
  const results = await Promise.allSettled(promises);
}

// 🚨 VULNERABILIDAD: Price Manipulation
if (priceManipulation) {
  console.log(`Original price: ${item.price} ETH`);
  console.log(`Manipulated price: ${manipulatedPrice} ETH`);
  await contractService.buyItem(item.id, manipulatedPrice);
}
  }
  await Promise.all(promises); // Condición de carrera
};
```

#### 💀 **Vectores de Ataque**
```javascript
// Método 1: Manipulación de Precio
const originalPrice = "5.0"; // ETH
const manipulatedPrice = "0.000001"; // ETH
// Ahorro: 99.99%+ descuento

// Método 2: Race Condition
// Enviar 3 transacciones simultáneas:
// - Puede causar double spending
// - Bypass de límites de compra
// - Estado inconsistente del contrato

// Método 3: Front-running
// 1. Monitorear mempool
// 2. Detectar transacción de compra
// 3. Enviar transacción idéntica con gas más alto
// 4. Confirmar primero

// Método 4: MEV (Maximal Extractable Value)
// Reorganizar transacciones para beneficio propio
```

#### 💰 **Impacto Financiero**
- **Price Manipulation**: Comprar items por casi $0
- **Race Conditions**: Double spending, bypass de límites
- **Front-running**: Robar oportunidades de compra
- **MEV Attacks**: Extraer valor de transacciones ajenas

#### 🛡️ **Mitigaciones**
- **Smart Contract Validation**: Validar precios en el contrato
- **Rate Limiting**: Limitar transacciones por usuario/tiempo
- **Commit-Reveal**: Esquemas de compromiso para operaciones sensibles
- **MEV Protection**: Usar servicios anti-MEV como Flashbots
- **Nonces**: Prevenir replay attacks con nonces únicos

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

5. **Probar Admin Panel Bypass + IDOR:**
   - Hacer clic en "🔑 REQUEST ADMIN ACCESS"
   - Probar los métodos de bypass:
     - **URL Bypass**: Agrega `?admin=true` a la URL
     - **localStorage Bypass**: Ejecuta `localStorage.setItem('admin_mode', 'enabled')`
     - **Debug Mode**: Ejecuta `window.DEBUG_MODE = true` en la consola
   - Una vez dentro, cambiar entre User ID 0, 1, 2 para ver datos sensibles
   - Observar private keys, seed phrases y datos personales expuestos

6. **Probar Purchase Manipulation:**
   - Seleccionar método de ataque:
     - **✅ Normal Purchase**: Compra legítima
     - **💰 Price Manipulation**: Modificar precio antes de comprar
     - **🏃‍♂️ Race Condition**: Múltiples transacciones simultáneas
     - **⚡ Front-running**: Simular front-running attack
   - **Para Price Manipulation**:
     - Cambiar el precio de 5.0 ETH a 0.000001 ETH
     - Observar el ahorro del 99.99%+
     - Ejecutar compra con precio manipulado
   - **Para Race Condition**:
     - Lanzar 3 transacciones simultáneas
     - Observar logs de múltiples intentos de compra
   - **Para Front-running**:
     - Simular monitoreo de mempool
     - Ver proceso de front-running en acción

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