import express from 'express'
// import axios from axios
import mongoose from 'mongoose';
import cors from 'cors'
import rideRoutes from './src/routes/ride.route.js'

const app = express();
app.use(cors());

app.use(express.json());
app.use('/rides', rideRoutes);



mongoose.connect(process.env.MONGO_URI || "")
    .then( () => console.log("MongoDB connected"))
    .catch(err => console.error("Mongo error: ", err.message));


const PORT = process.env.PORT || 3003;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ride Service running on port ${PORT}`);
});