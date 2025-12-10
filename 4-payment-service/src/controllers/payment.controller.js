import Payment from '../models/payment.model.js'
import axios from "axios"

export const getAll = async (req, res) => {
    const payments = await Payment.find();
    res.json(payments);
};


// 5.1 POST /payments with {rideId}
export const create = async (req, res) => {
    console.log('--- START PAYMENT PROCESSING FLOW ---')

    const { rideId } = req.body
    console.log(`Received Payment Request for Ride ID: ${rideId}`)

    // - ride = Gọi api Ride: GET /rides/${req.body}
    console.log(`1. Calling RIDE Service to fetch ride details: GET /rides/${rideId}`)

    const rideRes = await axios.get(`http://ride-service:3003/rides/${rideId}`)
    const ride = rideRes.data  

    console.log(`Ride details fetched. User: ${ride.userId}, Status: ${ride.status}, Amount: ${ride.price}, Driver: ${ride.driverId}`)

    // - verify ride.status == "COMPLETED"
    if (ride.status !== "COMPLETED") {
        console.warn(`Validation Failed: Ride status is ${ride.status}, expected COMPLETED.`); // LOG VALIDATION
        return res.status(400).json({ message: "Ride not completed" })
    }
    
    // - tạo object PAYMENT 
    const payment = {
            rideId: ride._id,
            userId: ride.userId,
            driverId: ride.driverId,
            amount: ride.price,
            status: "PAID"
    }

    // - Thêm vào DB
    console.log('2. Creating PAYMENT document in DB with status PAID.')
    const savedPayment = await Payment.create(payment)
    console.log(`Payment document created. Payment ID: ${savedPayment._id}`)

    // - Gọi api Driver: PUT /drivers/${ride.driverId} với {status: "AVAILABLE", current_ride_id: null}
    const driverUpdatePayload = {
        status: "AVAILABLE",
        current_ride_id: null
    }

    console.log(`3. Calling DRIVER Service to reset driver ${ride.driverId} status to AVAILABLE.`)
    await axios.put(`http://driver-service:3002/drivers/${ride.driverId}`, driverUpdatePayload)
    console.log('Driver status reset successful (AVAILABLE).')

    console.log('--- END PAYMENT PROCESSING FLOW SUCCESS ---')
    return res.status(201).json({
            message: "Payment created successfully",
            payment: savedPayment
    })
};



export const update = async (req, res) => {
    const payment = await Payment.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        {new: true}
    )
    res.json(payment)
}

export const health = (req, res) => {
    res.json({ service: 'payment-service', status: 'healthy' });
}

export const getOne = async (req, res) => {
    const payment = await Payment.findById(req.params.id)
    if(!payment) return res.status(404).json({message: "Not found"})
    res.json(payment)
}

export const remove = async (req, res) => {
    const payment = await Payment.findByIdAndDelete(req.params.id)
    if(!payment) return res.status(404).json({message: "Not found"})
    res.json({message: "Deleted"})
}


// List payments (supports optional query filters and pagination)
export const listPayments = async (req, res, next) => {
    try {
        const { userId, page = 1, limit = 20 } = req.query;
        const q = {};
        if (userId) q.user_id = userId;

        const skip = (Math.max(parseInt(page, 10), 1) - 1) * Math.max(parseInt(limit, 10), 1);
        const payments = await Payment.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));
        const total = await Payment.countDocuments(q);
        return res.json({ data: payments, meta: { total, page: parseInt(page, 10), limit: parseInt(limit, 10) } });
    } catch (err) {
        next(err);
    }
}

// Get payments by user id (history)
export const getPaymentsByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const payments = await Payment.findByUserId
            ? Payment.findByUserId(userId)
            : Payment.find({ user_id: userId }).then(p => p); // fallback
        return res.json({ data: await payments });
    } catch (err) {
        next(err);
    }
}