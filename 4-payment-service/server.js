import express from 'express'
import mongoose from 'mongoose';
import paymentRoutes from './src/routes/payment.route.js'

const app = express();
app.use(express.json());
app.use('/payments', paymentRoutes);


import cors from 'cors'
app.use(cors());


mongoose.connect(process.env.MONGO_URI || "")
    .then( () => console.log("MongoDB connected"))
    .catch(err => console.error("Mongo error: ", err.message));



const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
});