import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import paymentRoutes from './src/routes/payment.route.js'

const app = express();
app.use(cors());

app.use(express.json());
app.use('/payments', paymentRoutes);




mongoose.connect(process.env.MONGO_URI || "")
    .then( () => console.log("MongoDB connected"))
    .catch(err => console.error("Mongo error: ", err.message));



const PORT = process.env.PORT || 3004;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Payment Service running on port ${PORT}`);
});