import axios from 'axios'

import dotenv from 'dotenv';
dotenv.config();
const local_url = 'http://localhost:3000/rides'
const render_url = process.env.API_GATEWAY_RENDER

// script ride-request.js == User ấn đặt xe
const userId = "69393b9733261c2d0231aef7"
const start = {x: 22, y: 22}
const end = {x: 4, y: 3}

async function user_request_ride(userId, start, end) {
    const payload = {
        userId: userId,
        startLoc: {x: start.x, y: start.y},
        endLoc: {x: end.x, y: end.y}
    };

    console.log('Sending POST request to RIDE Service to create new ride') 
    // GỌI API RIDE SERVICE
    const response = await axios.post(`${render_url}/rides`, payload); 
    
    // Trả về dữ liệu đã được xử lý từ BE ({ rideId, status })
    console.log('RIDE Service response:', response.status, response.data)
    return response.data;
}

// Chạy script và console.log kết quả
const rideResult = await user_request_ride(userId, start, end);
console.log('Ride Request Successful:', rideResult);

