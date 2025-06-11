const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Salesforce domains for CORS
const allowedOrigins = [
  'https://*.salesforce.com',
  'https://*.force.com',
  'https://*.visualforce.com',
  'https://*.lightning.force.com',
  'https://*.salesforce-sites.com'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(origin);
      }
      return pattern === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// Security headers with iframe-friendly CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://*.salesforce.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.salesforce.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.salesforce.com"],
      frameSrc: ["'self'", "https://*.salesforce.com"],
      frameAncestors: ["https://*.salesforce.com", "https://*.force.com", "https://*.visualforce.com"]
    }
  },
  frameguard: false // Allow framing from Salesforce
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// API Routes
app.get('/api/lenses', (req, res) => {
  // Mock data - replace with database calls
  const lenses = [
    {
      id: 'L-00001',
      name: 'Marketing Lens',
      status: 'Published',
      description: 'Marketing content',
      lastRefreshed: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'L-00002',
      name: 'HR Lens',
      status: 'Draft',
      description: 'HR docs',
      lastRefreshed: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'L-00003',
      name: 'Finance Lens',
      status: 'Published',
      description: 'Finance data',
      lastRefreshed: new Date().toISOString()
    }
  ];
  
  res.json(lenses);
});

app.post('/api/lenses', (req, res) => {
  const { name, description, status } = req.body;
  
  // Mock implementation - replace with database logic
  const newLens = {
    id: 'L-' + String(Math.floor(Math.random() * 10000)).padStart(5, '0'),
    name,
    description,
    status,
    lastRefreshed: new Date().toISOString()
  };
  
  res.status(201).json(newLens);
});

app.post('/api/lenses/clone', (req, res) => {
  const { lensIds } = req.body;
  
  // Mock implementation
  const clonedLenses = lensIds.map(id => ({
    id: 'L-' + String(Math.floor(Math.random() * 10000)).padStart(5, '0'),
    name: `Cloned Lens from ${id}`,
    description: `Cloned from ${id}`,
    status: 'Draft',
    lastRefreshed: new Date().toISOString()
  }));
  
  res.json(clonedLenses);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});