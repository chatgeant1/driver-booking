import Payment from '../models/payment.model.js'

export const getAll = async (req, res) => {
    const payments = await Payment.find();
    res.json(payments);
};

export const create = async (req, res) => {
    const newPayment = new Payment(req.body);
    await newPayment.save();
    res.json(newPayment);
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