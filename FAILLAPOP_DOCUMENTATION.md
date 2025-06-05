# Faillapop - Documentación del Proyecto

## Descripción

**Faillapop** es una aplicación de marketplace descentralizada que permite a los usuarios comprar y vender productos usando tecnología blockchain (Ethereum). Se conecta con MetaMask para gestionar identidades y transacciones, ofreciendo roles diferenciados como comprador, vendedor y administrador.

---

## Tecnologías Utilizadas

### Frontend

* **React 16.3.0**
* **TypeScript**
* **CSS personalizado** 
* **React Router DOM** para navegación
* **Context API** para manejo global del estado
* **MetaMask** para conexión con Ethereum

---

## Estructura de Carpetas fronted

```
frontend/
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   ├── CreateItem.tsx
│   │   ├── ItemList.tsx
│   │   └── ItemDetails.tsx
│   ├── context/
│   │   └── UserContext.tsx
│   ├── types/
│   │   ├── User.ts
│   │   └── ethereum.d.ts
│   ├── styles/
│   │   └── global.css
│   └── App.tsx
├── public/
└── package.json
```

---

## Componentes Principales

### `WalletConnect.tsx`

* **Función:** Gestiona la conexión con MetaMask.
* **Funciones clave:**

  * `connectWallet`: conecta la wallet del usuario.
  * `getUserRole`: determina si es comprador, vendedor o admin.
* **Contexto usado:** `UserContext`.

---

### `CreateItem.tsx`

* **Función:** Permite a los vendedores crear productos.
* **Características:**

  * Formulario con validación.
  * Upload de imagen.
  * Campos para nombre, descripción, precio.
* **Estado local:** Usa hooks para controlar entradas.
* **Conexión Ethereum:** Envía transacción para registrar el producto en el smart contract.

---

### `ItemList.tsx`

* **Función:** Lista todos los artículos disponibles.
* **Características:**

  * Sistema de búsqueda por nombre.
  * Filtro por categorías o precio.
  * Responsive con diseño de grid.
* **Props:** recibe datos del backend o blockchain.
* **Renderiza:** múltiples `ItemCard` o componentes individuales.

---

### `ItemDetails.tsx`

* **Función:** Muestra información detallada de un producto.
* **Incluye:**

  * Imagen, descripción, precio.
  * Botón para comprar (si es comprador).
  * Valoraciones con estrellas.
* **Modal:** abre modales para compra o comentarios.

---

### `UserContext.tsx`

* **Función:** Define el contexto global del usuario.
* **Incluye:**

  * `address`: dirección pública de Ethereum.
  * `role`: rol actual.
  * Métodos para actualizar datos del usuario.

---

## Tipos e Interfaces

```ts
// Tipado de Usuario
interface User {
  address: string;
  role: UserRole;
}

type UserRole = 'buyer' | 'seller' | 'admin';

// Interfaz Ethereum
interface Ethereum {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
}
```

---

## Variables de Contratos

```ts
export const FAILLAPOP_SHOP_ADDRESS        = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
export const FAILLAPOP_TOKEN_ADDRESS       = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const FAILLAPOP_COOLNFT_ADDRESS     = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const FAILLAPOP_POWERSELLER_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const FAILLAPOP_DAO_ADDRESS         = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
export const FAILLAPOP_VAULT_ADDRESS       = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
export const FAILLAPOP_PROXY_ADDRESS       = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
```

---

## Características Principales

### Roles del Usuario

* **Buyer (Comprador):** Ver productos y comprarlos.
* **Seller (Vendedor):** Crear, editar y eliminar sus productos.
* **Admin:** Gestión total del sistema (moderación, DAO, etc.).

### Funciones clave de la app

* Conectar wallet con MetaMask.
* Crear y listar artículos desde smart contract.
* Enviar transacciones de compra.
* Almacenar valoraciones y comentarios.
* Interfaz responsive y modular.

//TODO: añadir vulnerabildiades
---


## Guía de Instalación

Para el fronted:

1. Clonar el proyecto:

```bash
git clone git@github.com:mredaht/Faillapop2.0.git
cd  frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar MetaMask:

   * Red de prueba: Anvil
   * Añadir dirección del contrato si es necesario

4. Ejecutar el proyecto:

```bash
npm run dev
```

5. Abrir en navegador:

```
http://localhost:3000
```

---


