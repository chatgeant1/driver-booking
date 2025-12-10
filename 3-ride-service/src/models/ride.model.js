import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  driverId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'Driver' },
  startLoc: {
    x: Number,
    y: Number
  },
  endLoc: {
    x: Number,
    y: Number
  },
  price: Number,
  status: { 
    type: String, 
    enum: [
        'REQUESTED',
        'ACCEPTED',
        'DRIVER_ARRIVED', 
        'IN_PROGRESS', 
        'ON_TRIP',
        'COMPLETED', 
        'CANCELLED', 
        'DRIVER_REJECTED'
    ], 
    default: 'REQUESTED' 
},
candidate_drivers: [
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    distance: Number 
  }
],
}, { timestamps: true });

const Ride = mongoose.model('Ride', rideSchema, "rides_collection");
export default Ride
