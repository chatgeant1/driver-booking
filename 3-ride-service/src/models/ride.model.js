import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  driverId: { type: String, default: null, ref: 'Driver' },
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
    driverId: { type: String, ref: 'Driver' },
    distance: Number 
  }
],
}, { timestamps: true });

const Ride = mongoose.model('Ride', rideSchema, "rides_collection");
export default Ride
