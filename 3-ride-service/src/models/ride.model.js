import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  startLocation: {
    lat: Number,
    lon: Number
  },
  endLocation: {
    lat: Number,
    lon: Number
  },
  price: Number,
  status: { type: String, enum:['requested','in_progress','completed','cancelled'], default:'requested' }
}, { timestamps: true });

const Ride = mongoose.model('Ride', rideSchema, "rides_collection");
export default Ride
