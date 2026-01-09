import express from 'express'
// import axios from axios
import mongoose from 'mongoose';
import cors from 'cors'
import rideRoutes from './src/routes/ride.route.js'

const app = express();
app.use(cors());

app.use(express.json());
app.use('/rides', rideRoutes);



// Create new ride
// axios to others service
// user_id, pickup_loc({lat, lng}), dropoff_loc({lat, lng}), vehicle_type.
// ride_id, Trạng thái (SEARCHING_DRIVER), estimated_fare(Phí ước tính).
app.post(['/rides', '/'], async (req, res) => {});


// Hủy chuyến đi
// user_id / driverId
// status: CANCELED
app.put('/rides/:id/cancel', ()=>{})

// PUT /rides/:id/status
// Cập nhật trạng thái chuyến đi (VD: DRIVER_ARRIVED, STARTED, COMPLETED).
// Trạng thái mới, Timestamp.
// ride_id, Trạng thái mới.


// POST /rides/fare
// Tính Phí (Dùng trong quá trình đặt xe).
// Vị trí đón (start_loc), Vị trí đến(end_loc), Loại xe.
// estimated_fare, estimated_distance_m.



mongoose.connect(process.env.MONGO_URI || "")
    .then( () => console.log("MongoDB connected"))
    .catch(err => console.error("Mongo error: ", err.message));


const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Ride Service running on port ${PORT}`);
});