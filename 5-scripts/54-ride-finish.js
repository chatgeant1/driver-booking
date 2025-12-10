// import {axios} from 'axios'

// script Driver ấn nút hoàn thành 
// Tạo string mẫu rideId (Lấy từ DB)
const rideId = ""

async function ride_finish() { 
    const response = await axios.put(`http://localhost:3000/rides/${rideId}/finish`); 
    return response.data;
}

// Chạy script và console.log kết quả
const result = await ride_finish();
console.log(result);



