import axios from 'axios'

// script ride-request.js == User ấn đặt xe
const userId = "69393bb133261c2d0231aef9"
const start = {x: 10, y: 12}
const end = {x: 32, y: 27}

async function user_request_ride(userId, start, end) {
    const payload = {
        userId: userId,
        startLoc: {x: start.x, y: start.y},
        endLoc: {x: end.x, y: end.y}
    };

    console.log('Sending POST request to RIDE Service to create new ride') 
    // GỌI API RIDE SERVICE
    const response = await axios.post('http://localhost:3000/rides', payload); 
    
    // Trả về dữ liệu đã được xử lý từ BE ({ rideId, status })
    console.log('RIDE Service response:', response.status, response.data)
    return response.data;
}

// Chạy script và console.log kết quả
const rideResult = await user_request_ride(userId, start, end);
console.log('Ride Request Successful:', rideResult);

