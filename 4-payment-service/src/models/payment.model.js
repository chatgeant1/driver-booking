import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  rideId: { type: String, required: true },
  userId: { type: String, required: true },
  driverId: { type: String, required: true },
  amount: Number,
  method: { type: String, enum:['cash','wallet'], default:'cash' },
  status: { type: String, enum:['PENDING','PAID','FAILED'], default:'PENDING' }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema, "payments_collection");
export default Payment


