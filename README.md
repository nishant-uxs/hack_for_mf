# 🏛️ CivicSense

**Blockchain-backed civic issue reporting platform for transparent urban governance**

## 🚀 Features

- **Secure Authentication** - JWT-based login/signup
- **Issue Reporting** - Upload photos, auto-detect location, categorize issues
- **Interactive Map** - Real-time visualization of all civic issues
- **Voting System** - Community-driven prioritization
- **Impact Score** - Automatic calculation: votes × days_pending
- **Blockchain Integration** - Tamper-proof complaint records on Polygon
- **Status Tracking** - Transparent complaint lifecycle
- **Proof-of-Resolution** - Before/after images with blockchain verification
- **Admin Panel** - Complaint verification and management
- **Analytics Dashboard** - Insights and statistics

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router
- Mapbox GL JS
- Recharts (Analytics)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer (File uploads)
- Express Rate Limit

### Blockchain
- Polygon (Mumbai Testnet)
- Solidity
- Ethers.js
- Hardhat

## 📁 Project Structure

```
CivicSense/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utilities
│   │   └── App.js
│   └── package.json
├── server/              # Express backend
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation
│   ├── utils/           # Helpers
│   └── server.js
├── smart-contract/      # Solidity contracts
│   ├── contracts/
│   ├── scripts/
│   └── hardhat.config.js
└── README.md
```

## 🔧 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- MetaMask wallet
- Polygon Mumbai testnet MATIC

### Setup

1. **Clone and install dependencies**
```bash
cd CivicSense
npm run install-all
```

2. **Configure environment variables**

Create `.env` in `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicsense
JWT_SECRET=your_jwt_secret_key_here
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=your_deployed_contract_address
PRIVATE_KEY=your_wallet_private_key
```

Create `.env` in `client/`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_POLYGON_RPC=https://rpc-mumbai.maticvigil.com
```

3. **Deploy Smart Contract**
```bash
cd smart-contract
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

4. **Start MongoDB**
```bash
mongod
```

5. **Run the application**
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

## 🔐 Security Features

- JWT authentication with secure httpOnly cookies
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- File upload size limits
- CORS configuration
- XSS protection

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📊 Architecture

### Hybrid Approach

**Off-chain (MongoDB)**
- User data
- Complaint details
- Images (URLs)
- Votes & comments
- Status updates

**On-chain (Polygon)**
- Complaint hash (SHA-256)
- Timestamp
- Status changes
- Immutable audit trail

### Data Flow

1. User submits complaint
2. Data saved to MongoDB
3. SHA-256 hash generated
4. Hash pushed to blockchain
5. Transaction ID returned
6. Any tampering detected via hash mismatch

## 🎨 Design Philosophy

Modern, minimal, professional UI inspired by:
- Stripe's clean aesthetics
- Notion's spacious layouts
- Modern SaaS best practices

## 📱 Responsive Design

Fully responsive across:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
```

### Backend (Heroku/Railway)
```bash
cd server
# Follow platform-specific deployment guide
```

### Database (MongoDB Atlas)
- Create cluster
- Update connection string
- Configure IP whitelist

## 📈 Performance Optimizations

- Lazy loading for map components
- Image optimization and compression
- API response caching
- Pagination for large datasets
- Debounced search inputs
- Code splitting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

For issues and questions:
- GitHub Issues
- Email: support@civicsense.io

---

**Built with ❤️ for transparent governance**
