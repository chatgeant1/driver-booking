import axios from 'axios'

import dotenv from 'dotenv';
dotenv.config();

const render_url = process.env.API_GATEWAY_RENDER

// script Driver (ko) nhận yêu cầu đặt xe
// Tạo string mẫu driverId (assigned), rideId (Theo DB)
const driverId = "69393d4c426587232df5190f"
const rideId = "6963f8a60869ea83747c8b84"

async function assigned_driver_response(number) { 
    const str = number == 1 ? "accept" : (number == 0 ? "reject" : "undefined")
    const local_url = `http://localhost:3000/rides/${rideId}/${str}`
    const payload = {driverId}
    
    console.log('Sending POST request to RIDE Service as driver response') 
    const response = await axios.post(`${render_url}/rides/${rideId}/${str}`, payload); 
    console.log('RIDE Service response:', response.status)

    return response.data;
}

// Chạy script và console.log kết quả
const result = await assigned_driver_response(1);
console.log(`Driver responsed the Ride`, result);