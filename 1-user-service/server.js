import express from 'express'
import mongoose from 'mongoose';
import userRoutes from './src/routes/user.route.js'
import cors from 'cors'


const app = express();
app.use(cors());

app.use(express.json());
app.use('/users', userRoutes);



mongoose.connect(process.env.MONGO_URI || "")
    .then( () => console.log("MongoDB connected"))
    .catch(err => console.error("Mongo error: ", err.message));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`User Service running on port ${PORT}`);
});