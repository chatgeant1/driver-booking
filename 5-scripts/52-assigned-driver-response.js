import axios from 'axios'

// script Driver (ko) nhận yêu cầu đặt xe
// Tạo string mẫu driverId (assigned), rideId (Theo DB)
const driverId = "69393cd3426587232df51907"
const rideId = "695dcadeb41f944f5a01cfe9"

async function assigned_driver_response(number) { 
    const str = number == 1 ? "accept" : (number == 0 ? "reject" : "undefined")

    const payload = {driverId}
    
    console.log('Sending POST request to RIDE Service as driver response') 
    const response = await axios.post(`http://localhost:3000/rides/${rideId}/${str}`, payload); 
    console.log('RIDE Service response:', response.status)

    return response.data;
}

// Chạy script và console.log kết quả
const result = await assigned_driver_response(1);
console.log(`Driver responsed the Ride`, result);