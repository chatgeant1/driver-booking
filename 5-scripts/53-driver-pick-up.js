import axios from 'axios'

import dotenv from 'dotenv';
dotenv.config();
const render_url = process.env.API_GATEWAY_RENDER

// script Driver đến nơi đón khách và ấn [bắt đầu] đi
// Tạo string mẫu rideId (Lấy từ DB)
const rideId = "6963f8a60869ea83747c8b84"

const local_url = `http://localhost:3000/rides/${rideId}/start`

// Driver nào gọi không được verify, bất kỳ driver nào cũng gọi được

async function driver_pick_up() {
    console.log('Sending PUT request to RIDE Service to start trip:', rideId) 
    
    const response = await axios.put(`${render_url}/rides/${rideId}/start`); 
    
    console.log('RIDE Service response:', response.status)
    
    return response.data;
}

// Chạy script và console.log kết quả
const result = await driver_pick_up();
console.log('Driver arrived and start the Ride: ', result);


