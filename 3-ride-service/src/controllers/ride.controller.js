import Ride from '../models/ride.model.js'
import axios from "axios"

export const getAll = async (req, res) => {
    const rides = await Ride.find();
    res.json(rides);
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
// chưa sửa nearby api, PUT /:driverId (2)
export const create = async (req, res) => {
    // tạo Ride mẫu ban đầu:
    const {userId, startLoc, endLoc} = req.body
    
    const dx = endLoc.x - startLoc.x
    const dy = endLoc.y - startLoc.y
    // khoảng cách Euclid trong mặt phẳng 2D
    const distance = Math.sqrt(dx*dx + dy*dy)
    
    const BASE_FARE = 10000
    const PRICE_PER_UNIT = 4000
    const price = BASE_FARE + distance * PRICE_PER_UNIT

    const RIDE = {
        userId,
        startLoc,
        endLoc,
        price,
        status: "REQUESTED",
        candidate_drivers: []
    }

    // gọi api GET /drivers/nearby-list lấy danh sách drivers gần nhất. 
    const driverRes = await axios.get(`http://localhost:3000/drivers/nearby-driver-list?x=${startLoc.x}&y=${startLoc.y}`); 
    const {nearby_drivers} = driverRes.data
    RIDE.candidate_drivers = nearby_drivers  

    // tạo document Ride mới trong DB sử dụng RIDE
    const newRide = await RideModel.create(RIDE)
    
    // lấy giá trị rideId mới tạo ra
    const rideId = newRide._id

    // lấy nearby_drivers[0].driver_id ra để gọi api DRIVER: PUT /:id với {status: "assigned"; rideId}  
    const driver_payload = {
        status: "ASSIGNED",
        current_ride_id: rideId
    }

    // Chưa check empty array.
    const driver_res = await axios.put(`http://localhost:3000/drivers/${nearby_drivers[0].driver_id}`, driver_payload); 

    return res.json({
        rideId,
        status: "REQUESTED",
        assignedDriverId: nearby_drivers[0].driver_id
    })
};
//------------------------------------------------------------------------------------------------------------------------------------------------------

// 2.1 Ride: POST /rides/:id/accept with {driverId}

export const driver_accept = async (req, res) => {
    
    const rideId = req.params.id
    const { driverId } = req.body
    
    const ride = await Ride.findById(rideId)
    if (!ride) return res.status(404).json({error: "Ride not found"})

    if (!driverId) {
      return res.status(400).json({ error: "Missing driverId" })
    }

    // verify driverId ∈ ride.candidate_drivers && ride.status=="REQUESTED"
    if (!ride.candidate_drivers.includes(driverId)) {
        return res.status(400).json({ error: "Driver not in candidate list" })
    }

    if (ride.status !== "REQUESTED") {
        return res.status(400).json({ error: "Ride not in REQUESTED status" })
    }    
    
    // Gọi api Driver: PUT /drivers/${req.body} với {status: "COMING"} - 
    await axios.put(`http://localhost:3000/drivers/${driverId}`, {
      status: "COMING",
      current_ride_id: rideId
    })

    //ride.driverId = driverId; ride.status = "IN_PROGRESS"; update DB
    ride.driverId = driverId
    ride.status = "IN_PROGRESS"
    await ride.save()

    return res.json({
      rideId,
      driverId,
      driver_status: "COMING",
      ride_status: "IN_PROGRESS"
    })
}


//------------------------------------------------------------------------------------------------------------------------------------------------------

//2.2 Ride: POST /rides/:id/reject with {driverId}

export const driver_reject = async (req, res) => {
    const rideId = req.params.id
    const { driverId } = req.body
    
    // --- basic validate ---
    if (!driverId) {
      return res.status(400).json({ error: "Missing driverId" })
    }

    // - ride = Query(RIDE, (req.params.id))
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" })
    }

    // - verify ride.status=="REQUESTED"
    if (ride.status !== "REQUESTED") {
      return res.status(400).json({ error: "Ride is not REQUESTED" })
    }

    // - Gọi api Driver: PUT /drivers/${req.body} với {status: "AVAILABLE", current_ride_id: null} - 
    await axios.put(`http://localhost:3000/drivers/${driverId}`, {
      status: "AVAILABLE",
      current_ride_id: null
    })

    // - ride.candidate_drivers.filter 
    ride.candidate_drivers = ride.candidate_drivers.filter(
      d => d.driverId !== driverId
    )

    // - kiểm tra ride.candidate_drivers.length > 0 ? tiếp tục : trả về {...}
    if (ride.candidate_drivers.length === 0) {
      ride.status = "CANCELLED"
      await ride.save()

      return res.json({
        rideId,
        status: "NO_DRIVER_AVAILABLE"
      })
    }

    // - lấy drivers[0].id ra để gọi api DRIVER: PUT /:id với {status:"ASSIGNED"; rideId} - 
    // - assign driver tiếp theo
    const nextDriver = ride.candidate_drivers[0].driverId
    await axios.put(`http://localhost:3000/drivers/${nextDriver}`, {
      status: "ASSIGNED",
      current_ride_id: rideId
    })

    await ride.save()

    return res.json({
      rideId,
      assignedDriver: nextDriver,
      status: "WAITING_FOR_DRIVER_RESPONSE"
    })
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
// 3.1 PUT /rides/:id/start

export const start = async (req, res) => {
    const rideId = req.params.id

    console.log(`Request received: PUT /rides/${rideId}/start`)

    // - ride = Query(RIDE, (req.params.id))
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" })
    }
    
    console.log('Fetched ride status:', ride.status, 'Driver ID:', ride.driverId)

    // - verify ride.status=="IN_PROGRESS" 
    if (ride.status !== "IN_PROGRESS") {
      return res.status(400).json({ error: "Ride not ready to start" })
    }    
    
    console.log('Ride status verified. Calling Driver Service...')

    console.log('Calling DRIVER Service to update status to "IN_RIDE":', ride.driverId)

    // - Gọi api Driver: PUT /drivers/${ride.driverId} với {status: "IN_RIDE", location: ride.startLoc} - 
    // tại đó cập nhật driver.status = "IN_RIDE", driver.location = location (vị trí tài xế = nơi đón khách), update DB
    await axios.put(`http://localhost:3000/drivers/${ride.driverId}`, {
      status: "IN_RIDE",
      location: {
        x: ride.startLoc.x,
        y: ride.startLoc.y
      }
    })    
    
    console.log('Driver status updated successfully.')

    // - ride.status = "ON_TRIP", updateDB.
    ride.status = "ON_TRIP"
    await ride.save()
    console.log('Ride status updated to ON_TRIP successfully.')

    console.log('Returning 200 OK for ride:', rideId)
        
    return res.json({
      rideId,
      status: "ON_TRIP"
    })
}

//------------------------------------------------------------------------------------------------------------------------------------------------------

// 4.1 PUT /rides/:id/finish

export const finish = async (req, res) => {
    const rideId = req.params.id
    // - ride = Query(RIDE, (req.params.id))
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" })
    }

    // - verify ride.status == "ON_TRIP"
    if (ride.status !== "ON_TRIP") {
      return res.status(400).json({ error: "Ride is not on trip" })
    }

    // - Gọi api Driver: PUT /drivers/${ride.driverId} với {status: "WAITING_FOR_PAYMENT", location: ride.endLoc} - 
    // tại đó cập nhật driver.status = "WAITING_FOR_PAYMENT", driver.location = location (vị trí tài xế = nơi trả khách), update DB
    await axios.put(`http://localhost:3000/drivers/${ride.driverId}`, {
      status: "WAITING_FOR_PAYMENT",
      location: {
        x: ride.endLoc.x,
        y: ride.endLoc.y
      }
    })
    
    // - ride.status = "COMPLETED", update DB
    ride.status = "COMPLETED"
    await ride.save()

    return res.json({
      rideId,
      status: "COMPLETED",
      message: "Ride finished, waiting for payment"
    })
}

//------------------------------------------------------------------------------------------------------------------------------------------------------

