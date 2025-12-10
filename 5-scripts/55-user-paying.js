// import {axios} from 'axios'

// script User ấn nút [thanh toán] 
// Tạo string mẫu rideId (Lấy từ DB)
const rideId = ""

async function user_paying() { 
    const payload = {rideId}
    const response = await axios.post(`http://localhost:3000/payments`, payload); 
    return response.data;
}

// Chạy script và console.log kết quả
const result = await user_paying();
console.log(result);


