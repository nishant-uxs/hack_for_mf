# ⚡ CivicSense Quick Start

Get CivicSense running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be v16+
mongod --version  # Should be v5+
```

## 1. Install Dependencies

```bash
cd CivicSense
npm run install-all
```

## 2. Start MongoDB

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

## 3. Get Required API Keys

### Mapbox Token (Free)
1. Visit https://account.mapbox.com/
2. Sign up and get your token
3. Copy the default public token

### Polygon Mumbai Testnet
1. Install MetaMask
2. Add Mumbai Testnet (Chain ID: 80001)
3. Get free MATIC from https://faucet.polygon.technology/

## 4. Configure Environment

### Smart Contract
Create `smart-contract/.env`:
```env
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_metamask_private_key
```

### Deploy Contract
```bash
cd smart-contract
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```
**Save the contract address!**

### Server
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicsense
JWT_SECRET=change_this_secret_key_in_production
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=your_deployed_contract_address
PRIVATE_KEY=your_metamask_private_key
NODE_ENV=development
```

### Client
Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_POLYGON_RPC=https://rpc-mumbai.maticvigil.com
```

## 5. Run the Application

```bash
# From root directory
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 6. Test It Out!

1. Open http://localhost:3000
2. Click "Sign Up" and create an account
3. Click "Report Issue"
4. Allow location access
5. Fill the form and submit
6. Check the blockchain transaction on Mumbai PolygonScan!

## Common Issues

**MongoDB not running?**
```bash
mongod
```

**Port 5000 already in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Need admin access?**
```bash
mongosh
use civicsense
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## Next Steps

- Read `SETUP.md` for detailed setup
- Read `ARCHITECTURE.md` for system design
- Read `README.md` for features and deployment

---

**Enjoy building a better community! 🏛️**
