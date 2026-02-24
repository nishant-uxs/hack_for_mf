# 🚀 CivicSense Setup Guide

Complete step-by-step guide to get CivicSense running locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **MetaMask** browser extension - [Install](https://metamask.io/)

## Step 1: MongoDB Setup

### Windows
1. Install MongoDB from the official website
2. Start MongoDB service:
```bash
net start MongoDB
```

### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu)
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

Verify MongoDB is running:
```bash
mongosh
```

## Step 2: Get Polygon Mumbai Testnet MATIC

1. Install MetaMask browser extension
2. Create/Import a wallet
3. Add Mumbai Testnet to MetaMask:
   - Network Name: Mumbai Testnet
   - RPC URL: https://rpc-mumbai.maticvigil.com
   - Chain ID: 80001
   - Currency Symbol: MATIC
   - Block Explorer: https://mumbai.polygonscan.com

4. Get free testnet MATIC from faucet:
   - Visit: https://faucet.polygon.technology/
   - Enter your wallet address
   - Request MATIC tokens

## Step 3: Get API Keys

### Mapbox Token (Required for Maps)
1. Go to https://account.mapbox.com/
2. Sign up for a free account
3. Navigate to "Access tokens"
4. Copy your default public token
5. Save it for later use

## Step 4: Clone and Install

```bash
# Navigate to your projects directory
cd e:\dti(CSET210)\CivicSense

# Install root dependencies
npm install

# Install all project dependencies
npm run install-all
```

This will install dependencies for:
- Root project
- Server (backend)
- Client (frontend)
- Smart contract

## Step 5: Configure Environment Variables

### Smart Contract Configuration

Create `smart-contract/.env`:
```env
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_metamask_wallet_private_key_here
```

**⚠️ IMPORTANT:** To get your private key from MetaMask:
1. Open MetaMask
2. Click the three dots menu
3. Account details → Export Private Key
4. Enter password and copy the key
5. **NEVER share this key or commit it to Git!**

### Deploy Smart Contract

```bash
cd smart-contract
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

**Save the contract address** that appears in the output!

### Server Configuration

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicsense
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=your_deployed_contract_address_from_above
PRIVATE_KEY=your_metamask_wallet_private_key
NODE_ENV=development
```

### Client Configuration

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_POLYGON_RPC=https://rpc-mumbai.maticvigil.com
```

## Step 6: Create Admin User (Optional)

After starting the server, you can manually create an admin user in MongoDB:

```bash
mongosh
use civicsense
db.users.updateOne(
  { email: "admin@civicsense.com" },
  { $set: { role: "admin" } }
)
```

Or register normally and then update the role in the database.

## Step 7: Start the Application

### Option 1: Run Everything Together (Recommended)
```bash
# From the root CivicSense directory
npm run dev
```

This starts both frontend and backend concurrently.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Step 8: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## Step 9: Test the Application

1. **Register a new account** at http://localhost:3000/register
2. **Login** with your credentials
3. **Report an issue:**
   - Go to "Report Issue"
   - Fill in the form
   - Allow location access
   - Upload images
   - Submit
4. **View on map** - Check the Map View to see your issue
5. **Vote on issues** - Click on any issue and vote
6. **Check blockchain** - View transaction on Mumbai PolygonScan

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### Blockchain Transaction Fails
**Solution:** 
- Ensure you have enough MATIC in your wallet
- Check if the contract address is correct
- Verify Mumbai testnet is accessible

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using that port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Mapbox Not Loading
**Solution:**
- Verify your Mapbox token is correct
- Check browser console for errors
- Ensure you're not exceeding free tier limits

### Images Not Uploading
**Solution:**
- Check if `server/uploads/complaints` directory exists
- Verify file size is under 5MB
- Ensure file format is supported (jpg, png, gif, webp)

## Production Deployment

### Environment Variables for Production

Update all `.env` files with production values:
- Use strong JWT secrets
- Use MongoDB Atlas for database
- Use Polygon Mainnet (requires real MATIC)
- Enable HTTPS
- Set proper CORS origins

### Recommended Hosting

- **Frontend:** Vercel, Netlify, or AWS S3 + CloudFront
- **Backend:** Heroku, Railway, AWS EC2, or DigitalOcean
- **Database:** MongoDB Atlas
- **Smart Contract:** Deploy to Polygon Mainnet

## Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Never commit `.env` files to Git
- [ ] Use environment variables for all sensitive data
- [ ] Enable rate limiting in production
- [ ] Set up proper CORS policies
- [ ] Use HTTPS in production
- [ ] Regularly update dependencies
- [ ] Implement proper input validation
- [ ] Set up monitoring and logging

## Need Help?

- Check the main README.md for architecture details
- Review the code documentation
- Check MongoDB logs: `mongod.log`
- Check server logs in terminal
- Inspect browser console for frontend errors

---

**You're all set! Start building a better community with CivicSense! 🏛️**
