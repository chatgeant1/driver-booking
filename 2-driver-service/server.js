import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'

import driverRoutes from './src/routes/driver.route.js'

const app = express();
app.use(cors());

app.use(express.json());
app.use('/drivers', driverRoutes);



mongoose.connect(process.env.MONGO_URI || "")
    .then( () => console.log("MongoDB connected"))
    .catch(err => console.error("Mongo error: ", err.message));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Driver Service running on port ${PORT}`);
});