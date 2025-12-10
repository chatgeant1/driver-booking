import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Enable CORS
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ service: 'api-gateway', status: 'healthy' });
});

// Proxy configuration
const services = {
    users: 'http://user-service:3001/users',
    drivers: 'http://driver-service:3002/drivers',
    rides: 'http://ride-service:3003/rides',
    payments: 'http://payment-service:3004/payments' 
};

// Create proxy middleware for each service
Object.keys(services).forEach(path => {
    app.use(`/${path}`, createProxyMiddleware({
        target: services[path],
        changeOrigin: true,
    }));
});

app.use(express.json());

// Default route: http://localhost:3000/
app.get('/', (req, res) => {
    res.json({
        message: 'API Gateway',
        services: Object.keys(services),
        endpoints: [
            'GET /users - Get all users',
            'POST /users - Create user',
            'GET /drivers - Get all drivers',
            'POST /drivers - Create driver',
            'GET /rides - Get all rides',
            'POST /rides - Create ride',
            'GET /payments - Get all payments',
            'POST /payments - Create payment',
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});

