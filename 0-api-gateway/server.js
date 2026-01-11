import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from './config.js';

const app = express();

// Enable CORS
app.use(cors());

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ service: 'api-gateway', status: 'healthy' });
});

// Proxy configuration
const services = {
    users: config.services.user,
    drivers: config.services.driver,
    rides: config.services.ride,
    payments: config.services.payment 
};

// Create proxy middleware for each service
// middleware: localhost:3000 use /{users}
// == "localhost:3000/users"
// => target: "user-service:3001/users"
// Path phía sau được giữ nguyên và forward sang target.
Object.keys(services).forEach(path => {
    app.use(`/${path}`, createProxyMiddleware({
        target: services[path],
        changeOrigin: true,
    }));
});

app.use(express.json());


// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});


app.listen(config.port, () => {
    console.log(`API Gateway running on port ${config.port}`);
});

