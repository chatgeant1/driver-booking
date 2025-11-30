import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: Number,
  method: { type: String, enum:['cash','wallet'], default:'cash' },
  status: { type: String, enum:['pending','paid','failed'], default:'pending' }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema, "payments_collection");
export default Payment


