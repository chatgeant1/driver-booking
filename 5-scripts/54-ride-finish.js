import axios from 'axios'

import dotenv from 'dotenv';
dotenv.config();
const render_url = process.env.API_GATEWAY_RENDER

// script Driver ấn nút hoàn thành 
// Tạo string mẫu rideId (Lấy từ DB)
const rideId = "6963f8a60869ea83747c8b84"
const local_url = `http://localhost:3000/rides/${rideId}/finish`

async function ride_finish() { 
    console.log('Sending PUT request to RIDE Service to finish ride') 
    const response = await axios.put(`${render_url}/rides/${rideId}/finish`); 
    console.log('RIDE Service response:', response.status)
    return response.data;
}

// Chạy script và console.log kết quả
const result = await ride_finish();
console.log('Ride Finished: ', result);



    
    
    