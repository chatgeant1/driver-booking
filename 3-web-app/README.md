# 3-web-app (Driver Booking frontend)

Local:
1. cd 3-web-app
2. npm install
3. npm run dev
4. Open http://localhost:5173

Vercel deployment:
1. Push repo to GitHub.
2. In Vercel, import repository and select this project root (3-web-app).
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set Environment Variables in Vercel (example):
   - VITE_USER_SERVICE_URL = https://your-api.example.com (points to /users)
   - VITE_DRIVER_SERVICE_URL = https://your-api.example.com (points to /drivers)

Notes:
- Vite exposes env variables that start with VITE_. Use them in code with import.meta.env.VITE_*
- For production, ensure your backend (API Gateway) is reachable from Vercel and CORS is configured.