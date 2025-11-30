import Ride from '../models/ride.model.js'

export const getAll = async (req, res) => {
    const rides = await Ride.find();
    res.json(rides);
};

export const create = async (req, res) => {
    const newRide = new Ride(req.body);
    await newRide.save();
    res.json(newRide);
};

export const update = async (req, res) => {
    const ride = await Ride.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        {new: true}
    )
    res.json(ride)
}

export const health = (req, res) => {
    res.json({ service: 'ride-service', status: 'healthy' });
}

export const getOne = async (req, res) => {
    const ride = await Ride.findById(req.params.id)
    if(!ride) return res.status(404).json({message: "Not found"})
    res.json(ride)
}

export const remove = async (req, res) => {
    const ride = await Ride.findByIdAndDelete(req.params.id)
    if(!ride) return res.status(404).json({message: "Not found"})
    res.json({message: "Deleted"})
}

// Allowed statuses for update
const ALLOWED_STATUSES = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'];

/**
 * List rides with optional pagination and filters
 * GET /rides?passengerId=...&driverId=...&status=...&page=1&limit=20
 */
export const listRides = async (req, res, next) => {
    try {
        const { passengerId, driverId, status, page = 1, limit = 20 } = req.query;
        const q = {};

        if (passengerId) q.passengerId = passengerId;
        if (driverId) q.driverId = driverId;
        if (status) q.status = status;

        const skip = (Math.max(parseInt(page, 10), 1) - 1) * Math.max(parseInt(limit, 10), 1);
        const rides = await Ride.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));
        const total = await Ride.countDocuments(q);

        return res.json({ data: rides, meta: { total, page: parseInt(page, 10), limit: parseInt(limit, 10) } });
    } catch (err) {
        return next(err);
    }
}

/**
 * Update ride status
 * PATCH /rides/:id/status
 * body: { status: 'accepted' }
 */
export const updateRideStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ error: `status is required and must be one of: ${ALLOWED_STATUSES.join(', ')}` });
        }

        const ride = await Ride.findById(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        ride.status = status;
        if (status === 'completed') ride.completedAt = new Date();

        const updated = await Ride.findByIdAndUpdate(id, ride, { new: true });
        return res.json(updated);
    } catch (err) {
        return next(err);
    }
}

/**
 * Assign a driver to a ride
 * POST /rides/:id/assign
 * body: { driverId: '...' }
 */
export const assignDriver = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { driverId } = req.body;

        if (!driverId) return res.status(400).json({ error: 'driverId is required' });

        const ride = await Ride.findById(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        if (ride.driverId && ride.driverId.toString() === driverId.toString()) {
            return res.status(200).json(ride);
        }

        ride.driverId = driverId;
        // If we assign a driver, move status to 'accepted' unless already further
        if (['requested'].includes(ride.status)) ride.status = 'accepted';
        const updated = await Ride.findByIdAndUpdate(id, ride, { new: true });

        return res.json(updated);
    } catch (err) {
        return next(err);
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
export const driver_accept = async (req, res) => {
    const {driverId} = req.body

    // Lấy req.params.id để lấy đối tượng ride, trong DB set status từ "requested" sang "in_progress"

    // gọi axios tới router.patch("/:id/status", ctl.update_status); {"status" : "..."} để thay đổi trạng thái driver từ "assigned" sang "coming"

    res.json({
        status: "ACCEPTED",
        driverId
    })
}


//------------------------------------------------------------------------------------------------------------------------------------------------------
export const driver_reject = async (req, res) => {
    const {driverId} = req.body

    // gọi axios tới router.patch("/:id/status", ctl.update_status); {"status" : "..."} để thay đổi trạng thái driver từ "assigned" sang "available"
    // gọi axios tới router.patch("/:id/ride-id", ctl.update_ride_id); để thay đổi current_ride_id (đã gán khi request) driver sang null. 

    // vì có list nearby nên nếu reject thì filter driverId này để lấy hay gọi hết danh sách là đc ?
    res.json({
        status: "REJECTED",
        driverId
    })
}
//------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------
