import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String, default: 'motorbike' },
    vehiclePlate: { type: String, default: 'qualified' },
    rating: { type: Number, default: 5.0 },
    location: {
        x: { type: Number, default: null },
        y: { type: Number, default: null }
    },
    status: { type: String, enum:['AVAILABLE','ASSIGNED', 'COMING', 'IN_RIDE', 'WAITING_FOR_PAYMENT'], default:'AVAILABLE' },
    current_ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null }
}, { timestamps: true });

const Driver = mongoose.model('Driver', DriverSchema, "drivers_collection");
export default Driver




                      