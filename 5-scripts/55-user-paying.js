import axios from 'axios'

import dotenv from 'dotenv';
dotenv.config();
const local_url = `http://localhost:3000/payments`
const render_url = process.env.API_GATEWAY_RENDER

// script User ấn nút [thanh toán] 
// Tạo string mẫu rideId (Lấy từ DB)
const rideId = "6963f8a60869ea83747c8b84"

async function user_paying() { 
    const payload = {rideId}

    console.log('Sending POST request to PAYMENT Service for user') 
    const response = await axios.post(`${render_url}/payments`, payload); 
    console.log('PAYMENT Service response:', response.status)

    return response.data;
}

// Chạy script và console.log kết quả
const result = await user_paying();
console.log("User paid: ", result);



    

