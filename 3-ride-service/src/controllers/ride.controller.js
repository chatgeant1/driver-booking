import Ride from '../models/ride.model.js'
import axios from "axios"

import config from '../../config.js'

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

//------------------------------------------------------------------------------------------------------------------------------------------------------
// 1.1 POST /rides with {userId, startLoc, endLoc}
export const create = async (req, res) => {

    console.log('--- START RIDE REQUEST ---')
    console.log('Input Data:', req.body); 

    // tạo Ride mẫu ban đầu:
    const {userId, startLoc, endLoc} = req.body
    
    const dx = endLoc.x - startLoc.x
    const dy = endLoc.y - startLoc.y
    // khoảng cách Euclid trong mặt phẳng 2D
    const distance = Math.sqrt(dx*dx + dy*dy)
    
    // BASE_FARE (Giá mở cửa): Thường là chi phí cố định cho x-km đầu tiên
    const BASE_FARE = 10000
    // PRICE_PER_UNIT (Giá mỗi km tiếp theo)
    const PRICE_PER_UNIT = 4000
    const price = BASE_FARE + distance * PRICE_PER_UNIT

    console.log(`Calculated Initial Price: ${price} (Distance: ${distance.toFixed(2)})`)

    const RIDE = {
        userId,
        startLoc,
        endLoc,
        price,
        status: "REQUESTED",
        candidate_drivers: []
    }

    // gọi api GET /drivers/nearby-list lấy danh sách drivers gần nhất. 
    
    console.log(`1. Calling DRIVER Service: GET /nearby-driver-list?x=${startLoc.x}&y=${startLoc.y}`); 
    
    try {
        const driverRes = await axios.get(`${config.services.driver}/nearby-driver-list?x=${startLoc.x}&y=${startLoc.y}`); 
        const {nearby_drivers} = driverRes.data
        RIDE.candidate_drivers = nearby_drivers // Cập nhật tên trường

        if (!nearby_drivers || nearby_drivers.length === 0) {
            console.warn('WARNING: No nearby drivers found.'); // LOG CẢNH BÁO
            // Xử lý trường hợp không tìm thấy tài xế
            // Ở đây, có thể tạo ride với status NO_DRIVERS_FOUND và return.
        }

    } catch (error) {
        console.error('ERROR: Failed to call DRIVER Service for nearby drivers.', error.message); // LOG LỖI S2S
        return res.status(503).json({ error: "Service temporarily unavailable or no drivers found." });
    }    
    
   

    // tạo document Ride mới trong DB sử dụng RIDE
    console.log('2. Creating new RIDE document in DB.')
    const newRide = await Ride.create(RIDE)
    
    // lấy giá trị rideId mới tạo ra
    const rideId = newRide._id
    console.log('New Ride Created with ID:', rideId.toString())

    // lấy nearby_drivers[0].driverId ra để gọi api DRIVER: PUT /:id với {status: "assigned"; rideId}  
    const assignedDriver = RIDE.candidate_drivers[0];
    // Xử lý khi không có tài xế để gán
    if (!assignedDriver) {
        console.warn('Cannot assign driver: No candidates available.');
        return res.json({
            rideId,
            status: "NO_DRIVERS_FOUND",
            assignedDriverId: null
        });
    }

    const driver_payload = {
        status: "ASSIGNED",
        current_ride_id: rideId.toString()
    }

    console.log(`3. Calling DRIVER Service to assign driver ${assignedDriver.driverId}. Payload:`, driver_payload)

    const driver_res = await axios.put(`${config.services.driver}/${assignedDriver.driverId}`, driver_payload); 
    console.log('Driver Service response status:', driver_res.status)

    console.log('--- END RIDE REQUEST SUCCESS ---')

    return res.json({
        rideId,
        status: "REQUESTED",
        assignedDriverId: assignedDriver.driverId
    })
};
//------------------------------------------------------------------------------------------------------------------------------------------------------

// 2.1 Ride: POST /rides/:id/accept with {driverId}

export const driver_accept = async (req, res) => {
    console.log('--- START DRIVER ACCEPTANCE FLOW ---')

    const rideId = req.params.id
    const { driverId } = req.body
    
    console.log(`Received Acceptance Request for Ride ID: ${rideId}, Driver ID: ${driverId}`)

    const ride = await Ride.findById(rideId)
    if (!ride) return res.status(404).json({error: "Ride not found"})

    // Sau khi Query thành công
    console.log(`Ride found. Current Status: ${ride.status}. Candidate Drivers: ${ride.candidate_drivers.map(d => d.driverId).join(', ')}`); // LOG DỮ LIỆU ĐÃ LẤY TỪ DB

    if (!driverId) {
      return res.status(400).json({ error: "Missing driverId" })
    }

    // verify driverId ∈ ride.candidate_drivers && ride.status=="REQUESTED"
    const isCandidate = ride.candidate_drivers.some(d => d.driverId.toString() === driverId);
    if (!isCandidate) {
        console.warn(`Validation Failed: Driver ${driverId} not in candidate list.`); // LOG VALIDATION
        return res.status(400).json({ error: "Driver not in candidate list" })
    }

    if (ride.status !== "REQUESTED") {
        console.warn(`Validation Failed: Ride status is ${ride.status}, expected REQUESTED.`); // LOG VALIDATION
        return res.status(400).json({ error: "Ride not in REQUESTED status" })
    }

    console.log('Validation passed. Starting state updates...')
    
    // Gọi api Driver: PUT /drivers/${req.body} với {status: "COMING"} - 
    const driverUpdatePayload = {
        status: "COMING",
        current_ride_id: rideId.toString()
    }
    console.log(`1. Calling DRIVER Service to update status. Payload:`, driverUpdatePayload)

    await axios.put(`${config.services.driver}/${driverId}`, driverUpdatePayload)

    console.log('Driver Service update successful. Updating RIDE status...')

    //ride.driverId = driverId; ride.status = "IN_PROGRESS"; update DB
    ride.driverId = driverId
    ride.status = "IN_PROGRESS"
    await ride.save()

    console.log(`2. RIDE DB Updated. Ride ID: ${rideId}, New Status: ${ride.status}`)

    const driver = await axios.get(`${config.services.driver}/${driverId}`)
    const driverLocation = driver.data.location;

    console.log('--- END DRIVER ACCEPTANCE FLOW SUCCESS ---')
    return res.json({
      rideId,
      driverId,
      driver_status: "COMING",
      ride_status: "IN_PROGRESS",
      driver_current_location: `(${driverLocation.x} ; ${driverLocation.y})`
    })
}


//------------------------------------------------------------------------------------------------------------------------------------------------------

//2.2 Ride: POST /rides/:id/reject with {driverId}

export const driver_reject = async (req, res) => {

    console.log('--- START DRIVER REJECTION FLOW ---')

    const rideId = req.params.id
    const { driverId } = req.body
    
    console.log(`Received Rejection Request for Ride ID: ${rideId}, Rejected Driver ID: ${driverId}`)

    // --- basic validate ---
    if (!driverId) {
      return res.status(400).json({ error: "Missing driverId" })
    }

    // - ride = Query(RIDE, (req.params.id))
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" })
    }

    // Sau khi Query thành công
    console.log(`Ride found. Current Status: ${ride.status}. Candidates before filter: ${ride.candidate_drivers.length}`); 

    // - verify ride.status=="REQUESTED"
    if (ride.status !== "REQUESTED") {
        console.warn(`Validation Failed: Ride status is ${ride.status}, expected REQUESTED.`); // LOG VALIDATION
        return res.status(400).json({ error: "Ride is not REQUESTED" })
    }

    // - Gọi api Driver: PUT /drivers/${req.body} với {status: "AVAILABLE", current_ride_id: null} - 
    const resetDriverPayload = { status: "AVAILABLE", current_ride_id: null }
    
    console.log(`1. Calling DRIVER Service to RESET rejected driver ${driverId} status to AVAILABLE.`)
    await axios.put(`${config.services.driver}/${driverId}`, resetDriverPayload)
    console.log('Rejected Driver status reset successfully.')

    // - ride.candidate_drivers.filter 
    ride.candidate_drivers = ride.candidate_drivers.filter(
        d => d.driverId.toString() !== driverId.toString() // Giả định chuyển đổi cho an toàn
    )
    console.log(`2. Filtered candidate list. Remaining candidates: ${ride.candidate_drivers.length}`)

    // - kiểm tra ride.candidate_drivers.length > 0 ? tiếp tục : trả về {...}
    if (ride.candidate_drivers.length === 0) {
      ride.status = "CANCELLED"
      await ride.save()

      console.log(`3. No remaining candidates. RIDE status updated to CANCELLED.`)

      console.log('--- END DRIVER REJECTION FLOW (CANCELLED) ---')
      return res.json({
        rideId,
        status: "NO_DRIVER_AVAILABLE"
      })
    }

    // - lấy drivers[0].id ra để gọi api DRIVER: PUT /:id với {status:"ASSIGNED"; rideId} - 
    // - assign driver tiếp theo
    const nextDriver = ride.candidate_drivers[0].driverId
    const assignNextDriverPayload = {
        status: "ASSIGNED",
        current_ride_id: rideId.toString()
    }

    console.log(`4. Assigning next driver ${nextDriver.toString()} to ride ${rideId}.`)
    await axios.put(`${config.services.driver}/${nextDriver}`, assignNextDriverPayload)
    console.log('Next driver status updated to ASSIGNED successfully.')

    await ride.save()

    console.log('--- END DRIVER REJECTION FLOW (RE-ASSIGNED) ---')
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

    console.log(`=====Request received: PUT /rides/${rideId}/start=====`)

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
    await axios.put(`${config.services.driver}/${ride.driverId}`, {
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

    console.log('=====Returning 200 OK for ride:', rideId, "=====")
        
    return res.json({
      rideId,
      ride_status: "ON_TRIP",
      driver_status: "IN_RIDE",
      driver_current_location: `(${ride.startLoc.x} ; ${ride.startLoc.y})`
    })
}

//------------------------------------------------------------------------------------------------------------------------------------------------------

// 4.1 PUT /rides/:id/finish

export const finish = async (req, res) => {
    console.log('--- START RIDE FINISH FLOW ---')

    const rideId = req.params.id

    console.log(`Request received: PUT /rides/${rideId}/finish`)

    // - ride = Query(RIDE, (req.params.id))
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" })
    }

    console.log('Fetched ride status:', ride.status, 'Driver ID:', ride.driverId)
    
    // - verify ride.status == "ON_TRIP"
    if (ride.status !== "ON_TRIP") {
        console.warn(`Validation Failed: Ride status is ${ride.status}, expected ON_TRIP.`); // LOG VALIDATION
        return res.status(400).json({ error: "Ride is not on trip" })
    }
    
    console.log('Validation passed. Starting state updates...')

    // - Gọi api Driver: PUT /drivers/${ride.driverId} với {status: "WAITING_FOR_PAYMENT", location: ride.endLoc} - 
    // tại đó cập nhật driver.status = "WAITING_FOR_PAYMENT", driver.location = location (vị trí tài xế = nơi trả khách), update DB

    const driverUpdatePayload = {
        status: "WAITING_FOR_PAYMENT",
        location: {
            x: ride.endLoc.x,
            y: ride.endLoc.y
        }
    }    
    
    console.log(`1. Calling DRIVER Service to update status to WAITING_FOR_PAYMENT.`)
    await axios.put(`${config.services.driver}/${ride.driverId}`, driverUpdatePayload)
    console.log('Driver status updated successfully.')
    
    // - ride.status = "COMPLETED", update DB
    ride.status = "COMPLETED"
    await ride.save()
    console.log('2. RIDE DB Updated. Ride status set to COMPLETED.')

    console.log('Returning 200 OK for ride:', rideId)
    console.log('--- END RIDE FINISH FLOW ---')
    return res.json({
      rideId,
      status: "COMPLETED",
      message: "Ride finished, waiting for payment",
      driver_current_location: `(${ride.endLoc.x} ; ${ride.endLoc.y})`
    })
}

//------------------------------------------------------------------------------------------------------------------------------------------------------

