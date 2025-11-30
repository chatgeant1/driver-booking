import express from 'express'
import mongoose from 'mongoose';
import userRoutes from './src/routes/user.route.js'

const app = express();
app.use(express.json());
app.use('/users', userRoutes);


mongoose.connect(process.env.MONGO_URI || "")
    .then( () => console.log("MongoDB connected"))
    .catch(err => console.error("Mongo error: ", err.message));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});