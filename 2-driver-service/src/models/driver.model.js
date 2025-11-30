import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String, default: 'motorbike' },
    vehiclePlate: { type: String, required: true },
    rating: { type: Number, default: 5.0 },
    location: {
        lat: { type: Number, default: null },
        lon: { type: Number, default: null }
    },
    status: { type: String, enum:['available','assigned', 'coming', 'in_ride'], default:'available' },
    current_ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null }
}, { timestamps: true });

const Driver = mongoose.model('Driver', DriverSchema, "drivers_collection");
export default Driver




                      