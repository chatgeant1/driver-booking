import axios from 'axios'

// script Driver đến nơi đón khách và ấn [bắt đầu] đi
// Tạo string mẫu rideId (Lấy từ DB)
const rideId = "69395b6b714c2e5123acb0db"

// Driver nào gọi không được verify, bất kỳ driver nào cũng gọi được

async function driver_pick_up() {
    console.log('Sending PUT request to RIDE Service to start trip:', rideId) 
    
    const response = await axios.put(`http://localhost:3000/rides/${rideId}/start`); 
    
    console.log('RIDE Service response:', response.status)
    
    return response.data;
}

// Chạy script và console.log kết quả
const result = await driver_pick_up();
console.log('Driver arrived and start the Ride: ', result);


