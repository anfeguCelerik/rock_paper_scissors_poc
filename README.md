# Rock Paper Scissors Game - World Org PoC

Este es un Proof of Concept (PoC) que demuestra la integración del World Org Mini Kit con un juego simple de Piedra, Papel o Tijeras usando smart contracts. El juego permite a los usuarios apostar ETH/WLD y jugar contra la casa.

## Características

- Juego de Piedra, Papel o Tijeras contra la casa
- Apuestas con ETH (red local) o WLD (World Sepolia)
- Integración con World Org Mini Kit
- Interfaz de usuario intuitiva
- Historial de últimas 3 jugadas
- Manejo de balance y apuestas

## Desarrollo

Este PoC demuestra una integración básica con World Org, validando la conexión con World Chain en Sepolia. Sin embargo, para una integración más directa y alineada con el ecosistema de World App como partner, se requiere acceso ampliado a la documentación de World ID.

Algunas áreas de mejora incluyen:

Implementación de contratos en OP Stack.
Manejo de off-ramps dentro del ecosistema.
Expansión del uso de librerías oficiales de World App.
Además, se pueden explorar optimizaciones como:

Sistema de rankings.
Modo multijugador.
Integración con World ID para verificación de identidad.
Mejora en la aleatoriedad mediante oráculos o integración con World-App.
Sistema de recompensas y torneos.
  
## Requisitos Previos

- Node.js (v18 o superior)
- MetaMask
- Git

## Configuración Local

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd rock_paper_scissors_poc
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo .env:
```bash
cp .env.example .env
```

4. Iniciar el nodo local de Hardhat:
```bash
npx hardhat node
```

5. En una nueva terminal, desplegar el contrato:
```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

6. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

7. Configurar MetaMask:
   - Agregar red local:
     - Network Name: Hardhat Local
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency Symbol: ETH
   - Importar una cuenta de prueba usando las claves privadas mostradas al iniciar el nodo Hardhat

## Configuración World Sepolia Testnet

1. Obtener WLD de prueba:
   - Visitar el [World Faucet](https://faucet.worldcoin.org)
   - Conectar wallet
   - Solicitar WLD de prueba

2. Configurar variables de entorno:
```bash
# .env
PRIVATE_KEY=tu_clave_privada
WORLD_SEPOLIA_RPC_URL=https://sepolia.world.org
```

3. Desplegar en World Sepolia:
```bash
npx hardhat run scripts/deploy.cjs --network worldSepolia
```

4. Configurar MetaMask para World Sepolia:
   - Network Name: World Sepolia
   - RPC URL: https://sepolia.world.org
   - Chain ID: 11155111
   - Currency Symbol: WLD

## Uso

1. Conectar wallet usando el botón "Connect Wallet"
2. Seleccionar una apuesta (0.1 a 1 ETH/WLD)
3. Elegir Piedra, Papel o Tijeras
4. Confirmar la transacción en MetaMask
5. Esperar el resultado
6. ¡Jugar de nuevo!

## Arquitectura

- **Smart Contract**: Implementado en Solidity, maneja la lógica del juego y los pagos
- **Frontend**: React + Vite, usando wagmi para interacción con Web3
- **Estilo**: CSS puro para una interfaz limpia y responsiva

## Notas

Este es un Proof of Concept y no debe usarse en producción sin las debidas auditorías y mejoras de seguridad.

## Licencia

MIT
