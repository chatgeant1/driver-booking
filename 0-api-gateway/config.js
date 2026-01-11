import dotenv from 'dotenv';
dotenv.config();

// Cho api-gateway

const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  services: {
    // Thứ tự ưu tiên: Cloud (Render) -> Docker (Service Name) -> Local
    // Khai báo render_url trong Render thì process.env.RENDER_URL có giá trị == ko cần kbao render_url ở local.
    // Chạy docker (render_url chưa có): gtri 2nd sẽ chạy
    user: process.env.USER_SERVICE_URL || process.env.USER_DOCKER_URL || 'http://localhost:3001/users',
    driver: process.env.DRIVER_SERVICE_URL || process.env.DRIVER_DOCKER_URL || 'http://localhost:3002/drivers',
    ride: process.env.RIDE_SERVICE_URL || process.env.RIDE_DOCKER_URL || 'http://localhost:3003/rides',
    payment: process.env.PAYMENT_SERVICE_URL || process.env.PAYMENT_DOCKER_URL || 'http://localhost:3004/payments',
    gateway: process.env.GATEWAY_SERVICE_URL || 'http://localhost:3000',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

export default config;
