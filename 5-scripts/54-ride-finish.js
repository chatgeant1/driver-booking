import axios from 'axios'

// script Driver ấn nút hoàn thành 
// Tạo string mẫu rideId (Lấy từ DB)
const rideId = "693995ca88064b8da0339de1"

async function ride_finish() { 
    console.log('Sending PUT request to RIDE Service to finish ride') 
    const response = await axios.put(`http://localhost:3000/rides/${rideId}/finish`); 
    console.log('RIDE Service response:', response.status)
    return response.data;
}

// Chạy script và console.log kết quả
const result = await ride_finish();
console.log('Ride Finished: ', result);



    
    
    