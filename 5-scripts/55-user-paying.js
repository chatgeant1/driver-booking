import axios from 'axios'

// script User ấn nút [thanh toán] 
// Tạo string mẫu rideId (Lấy từ DB)
const rideId = "693995ca88064b8da0339de1"

async function user_paying() { 
    const payload = {rideId}

    console.log('Sending POST request to PAYMENT Service for user') 
    const response = await axios.post(`http://localhost:3000/payments`, payload); 
    console.log('PAYMENT Service response:', response.status)

    return response.data;
}

// Chạy script và console.log kết quả
const result = await user_paying();
console.log("User paid: ", result);



    

