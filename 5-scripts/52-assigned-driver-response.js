// import {axios} from 'axios'

// script Driver (ko) nhận yêu cầu đặt xe
// Tạo string mẫu driverId (assigned), rideId (Theo DB)
const driverId = ""
const rideId = ""

async function assigned_driver_response(number) { 
    const str = number == 1 ? "accept" : (number == 0 ? "reject" : "undefined")

    const payload = {driverId}
    
    const response = await axios.post(`http://localhost:3000/rides/${rideId}/${str}`, payload); 
    
    return response.data;
}

// Chạy script và console.log kết quả
const result = await assigned_driver_response(1);
console.log(result);
