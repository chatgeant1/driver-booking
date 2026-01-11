import axios from 'axios'

// script Driver ấn nút hoàn thành 
// Tạo string mẫu rideId (Lấy từ DB)
const rideId = "6963ab8b9e7c767b94e10be5"

async function ride_finish() { 
    console.log('Sending PUT request to RIDE Service to finish ride') 
    const response = await axios.put(`http://localhost:3000/rides/${rideId}/finish`); 
    console.log('RIDE Service response:', response.status)
    return response.data;
}

// Chạy script và console.log kết quả
const result = await ride_finish();
console.log('Ride Finished: ', result);



    
    
    