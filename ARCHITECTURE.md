# 🏗️ CivicSense Architecture

## System Overview

CivicSense follows a **hybrid architecture** combining traditional web technologies with blockchain for data integrity.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│              React + Tailwind + Mapbox                       │
└─────────────────┬───────────────────────────────────────────┘
                  │ REST API (Axios)
┌─────────────────▼───────────────────────────────────────────┐
│                         Backend                              │
│              Node.js + Express + MongoDB                     │
└─────────────────┬───────────────────────────────────────────┘
                  │ Ethers.js
┌─────────────────▼───────────────────────────────────────────┐
│                       Blockchain                             │
│              Polygon (Smart Contract)                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Complaint Registration

```
User → Frontend → Backend → MongoDB (Store Data)
                           ↓
                    Generate SHA-256 Hash
                           ↓
                    Blockchain (Store Hash)
                           ↓
                    Return Transaction ID
```

### 2. Complaint Verification

```
User Request → Backend → Fetch from MongoDB
                      ↓
              Generate Hash from Data
                      ↓
              Compare with Blockchain Hash
                      ↓
              Return Verification Status
```

## Technology Stack Details

### Frontend (Client)

**Framework:** React 18
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Maps:** Mapbox GL JS + react-map-gl
- **Charts:** Recharts
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Blockchain:** Ethers.js

**Key Features:**
- Responsive design (mobile-first)
- Protected routes with authentication
- Real-time map visualization
- Image upload with preview
- Form validation
- Loading states and error handling

### Backend (Server)

**Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Security:** Helmet, CORS, bcryptjs
- **Rate Limiting:** express-rate-limit
- **Validation:** express-validator
- **Blockchain:** Ethers.js

**API Structure:**
```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── GET /me
├── /complaints
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── POST /:id/vote
│   └── GET /nearby
├── /admin
│   ├── PATCH /:id/verify
│   ├── PATCH /:id/status
│   ├── PATCH /:id/resolve
│   ├── DELETE /:id
│   └── GET /anomalies
├── /analytics
│   └── GET /
└── /users
    ├── GET /profile
    └── PATCH /profile
```

### Database (MongoDB)

**Collections:**

**Users:**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (enum: ['user', 'admin']),
  walletAddress: String,
  complaintsReported: [ObjectId],
  votedComplaints: [ObjectId],
  createdAt: Date
}
```

**Complaints:**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String (enum),
  location: {
    type: 'Point',
    coordinates: [Number, Number],
    address: String
  },
  images: [String],
  status: String (enum),
  reporter: ObjectId (ref: User),
  votes: Number,
  voters: [ObjectId],
  impactScore: Number,
  blockchainHash: String,
  transactionId: String,
  resolutionImages: [String],
  resolutionHash: String,
  resolutionTransactionId: String,
  statusHistory: [{
    status: String,
    timestamp: Date,
    updatedBy: ObjectId
  }],
  verifiedBy: ObjectId,
  verifiedAt: Date,
  resolvedAt: Date,
  createdAt: Date
}
```

**Indexes:**
- `location` (2dsphere) - for geospatial queries
- `status` - for filtering
- `category` - for filtering
- `createdAt` - for sorting
- `impactScore` - for sorting

### Blockchain (Smart Contract)

**Platform:** Polygon (Mumbai Testnet)
**Language:** Solidity 0.8.20
**Framework:** Hardhat

**Contract Structure:**
```solidity
contract CivicSense {
  struct Complaint {
    string complaintHash;
    uint256 timestamp;
    ComplaintStatus status;
    address reporter;
    bool exists;
  }
  
  struct StatusUpdate {
    ComplaintStatus status;
    uint256 timestamp;
    string resolutionHash;
  }
  
  mapping(string => Complaint) public complaints;
  mapping(string => StatusUpdate[]) public statusHistory;
}
```

**Key Functions:**
- `registerComplaint()` - Store complaint hash
- `updateComplaintStatus()` - Update status on-chain
- `resolveComplaint()` - Mark as resolved with proof
- `verifyComplaint()` - Verify data integrity
- `getComplaint()` - Retrieve complaint data
- `getStatusHistory()` - Get status timeline

## Security Architecture

### Authentication Flow

```
1. User Registration/Login
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT token
   ↓
4. Client stores token (localStorage)
   ↓
5. Client sends token in Authorization header
   ↓
6. Server validates token on protected routes
```

### Data Security

**Password Security:**
- Hashed using bcrypt (12 rounds)
- Never stored in plain text
- Never transmitted in responses

**JWT Security:**
- Signed with secret key
- 30-day expiration
- Includes user ID and role
- Validated on every protected route

**File Upload Security:**
- File type validation (images only)
- File size limit (5MB)
- Sanitized filenames
- Stored outside web root

**API Security:**
- Rate limiting (100 requests/15 minutes)
- CORS configuration
- Helmet for HTTP headers
- Input validation and sanitization
- XSS protection

### Blockchain Security

**Hash Generation:**
- SHA-256 algorithm
- Includes all complaint data
- Deterministic (same data = same hash)

**Immutability:**
- Once on blockchain, cannot be altered
- Any data change = hash mismatch
- Provides tamper-proof audit trail

**Access Control:**
- Only contract owner can update status
- Anyone can verify integrity
- Transparent and auditable

## Performance Optimizations

### Frontend
- Code splitting with React.lazy()
- Image lazy loading
- Debounced search inputs
- Pagination for large datasets
- Cached API responses
- Optimized re-renders with React.memo

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Response compression
- Efficient aggregation pipelines

### Database
- Geospatial indexes for location queries
- Compound indexes for common filters
- Projection to limit returned fields
- Pagination to limit result size

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- JWT for distributed auth
- MongoDB replica sets
- Load balancer ready

### Vertical Scaling
- Efficient database queries
- Optimized blockchain calls
- Image compression
- CDN for static assets

### Caching Strategy
- Browser caching for static assets
- API response caching (Redis in production)
- Database query caching
- Mapbox tile caching

## Monitoring & Logging

### Application Logs
- Request/response logging
- Error tracking
- Performance metrics
- User activity logs

### Blockchain Monitoring
- Transaction confirmations
- Gas usage tracking
- Failed transactions
- Contract events

### Database Monitoring
- Query performance
- Connection pool status
- Storage usage
- Index efficiency

## Deployment Architecture

### Development
```
localhost:3000 (React Dev Server)
localhost:5000 (Express Server)
localhost:27017 (MongoDB)
Mumbai Testnet (Polygon)
```

### Production
```
Frontend: Vercel/Netlify (CDN)
Backend: Heroku/Railway (Container)
Database: MongoDB Atlas (Cloud)
Blockchain: Polygon Mainnet
```

## Future Enhancements

### Technical
- [ ] Redis caching layer
- [ ] WebSocket for real-time updates
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline

### Features
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] ML-based spam detection
- [ ] Multi-language support
- [ ] Dark mode

### Blockchain
- [ ] IPFS for image storage
- [ ] NFT badges for active citizens
- [ ] DAO governance
- [ ] Token rewards
- [ ] Cross-chain support

---

This architecture ensures **scalability**, **security**, and **transparency** while maintaining excellent **performance** and **user experience**.
