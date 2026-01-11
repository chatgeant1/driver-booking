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

//------------------------------------------------------------------------------------------------------------------------------------------------------
// 1.1 POST /rides with {userId, startLoc, endLoc}
export const create = async (req, res) => {

    try {
        const { userId, startLoc, endLoc } = req.body;

        // 1. Logic tính giá sơ bộ (nếu cần)
        const dx = endLoc.x - startLoc.x;
        const dy = endLoc.y - startLoc.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const price = Math.round(distance * 5000 + 15000); 

        // 2. Tạo bản ghi chuyến đi mới
        const newRide = new Ride({
            userId,
            startLoc,
            endLoc,
            price,
            status: 'REQUESTED'
        });

        // 3. Giả lập tìm tài xế gần nhất (Mock logic)
        // Trong thực tế, đoạn này sẽ gọi sang Driver Service
        const ride = await newRide.save();

        console.log(`[Ride Service] New ride created: ${ride._id} - ride.controller.js:86`);

        // 4. Trả về đầy đủ thông tin để FE xử lý bản đồ
        return res.status(201).json({
            ride_id: ride._id,
            status: ride.status,
            startLoc: ride.startLoc, // {x, y}
            endLoc: ride.endLoc,     // {x, y}
            price: ride.price,
            message: "Đang tìm kiếm tài xế gần nhất..."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

    // gọi api GET /drivers/nearby-list lấy danh sách drivers gần nhất. 
    
    console.log(`1. Calling DRIVER Service: GET /nearbydriverlist?x=${startLoc.x}&y=${startLoc.y} - ride.controller.js:103`); 
    
    try {
        const driverRes = await axios.get(`http://driver-service:3002/drivers/nearby-driver-list?x=${startLoc.x}&y=${startLoc.y}`); 
        const {nearby_drivers} = driverRes.data
        RIDE.candidate_drivers = nearby_drivers // Cập nhật tên trường

        if (!nearby_drivers || nearby_drivers.length === 0) {
            console.warn('WARNING: No nearby drivers found. - ride.controller.js:111'); // LOG CẢNH BÁO
            // Xử lý trường hợp không tìm thấy tài xế
            // Ở đây, có thể tạo ride với status NO_DRIVERS_FOUND và return.
        }

    } catch (error) {
        console.error('ERROR: Failed to call DRIVER Service for nearby drivers. - ride.controller.js:117', error.message); // LOG LỖI S2S
        return res.status(503).json({ error: "Service temporarily unavailable or no drivers found." });
    }    
    
   

    // tạo document Ride mới trong DB sử dụng RIDE
    console.log('2. Creating new RIDE document in DB. - ride.controller.js:124')
    const newRide = await Ride.create(RIDE)
    
    // lấy giá trị rideId mới tạo ra
    const rideId = newRide._id
    console.log('New Ride Created with ID: - ride.controller.js:129', rideId.toString())

    // lấy nearby_drivers[0].driverId ra để gọi api DRIVER: PUT /:id với {status: "assigned"; rideId}  
    const assignedDriver = RIDE.candidate_drivers[0];
    // Xử lý khi không có tài xế để gán
    if (!assignedDriver) {
        console.warn('Cannot assign driver: No candidates available. - ride.controller.js:135');
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

    console.log(`3. Calling DRIVER Service to assign driver ${assignedDriver.driverId}. Payload: - ride.controller.js:148`, driver_payload)

    const driver_res = await axios.put(`http://driver-service:3002/drivers/${assignedDriver.driverId}`, driver_payload); 
    console.log('Driver Service response status: - ride.controller.js:151', driver_res.status)

    console.log('END RIDE REQUEST SUCCESS - ride.controller.js:153')

    // ride.controller.js - Chỉnh sửa dòng cuối của hàm create
    return res.json({
    ride_id: rideId, // đổi tên cho khớp với App.jsx (ride_id)
    status: "REQUESTED",
    assignedDriverId: assignedDriver.driverId,
    startLoc: RIDE.startLoc, // Thêm cái này
    endLoc: RIDE.endLoc,     // Thêm cái này
    price: RIDE.price
});
};
//------------------------------------------------------------------------------------------------------------------------------------------------------

// 2.1 Ride: POST /rides/:id/accept with {driverId}

export const driver_accept = async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId } = req.body; // FE phải gửi cái này lên

        const ride = await Ride.findByIdAndUpdate(id, { 
            status: 'ACCEPTED', 
            driverId: driverId 
        }, { new: true });

        res.json(ride);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
    console.log('START DRIVER ACCEPTANCE FLOW - ride.controller.js:184')

    const rideId = req.params.id
    const { driverId } = req.body
    
    console.log(`Received Acceptance Request for Ride ID: ${rideId}, Driver ID: ${driverId} - ride.controller.js:189`)

    const ride = await Ride.findById(rideId)
    if (!ride) return res.status(404).json({error: "Ride not found"})

    // Sau khi Query thành công
    console.log(`Ride found. Current Status: ${ride.status}. Candidate Drivers: ${ride.candidate_drivers.map(d => d.driverId).join(', ')} - ride.controller.js:195`); // LOG DỮ LIỆU ĐÃ LẤY TỪ DB

    if (!driverId) {
      return res.status(400).json({ error: "Missing driverId" })
    }

    // verify driverId ∈ ride.candidate_drivers && ride.status=="REQUESTED"
    const isCandidate = ride.candidate_drivers.some(d => d.driverId.toString() === driverId);
    if (!isCandidate) {
        console.warn(`Validation Failed: Driver ${driverId} not in candidate list. - ride.controller.js:204`); // LOG VALIDATION
        return res.status(400).json({ error: "Driver not in candidate list" })
    }

    if (ride.status !== "REQUESTED") {
        console.warn(`Validation Failed: Ride status is ${ride.status}, expected REQUESTED. - ride.controller.js:209`); // LOG VALIDATION
        return res.status(400).json({ error: "Ride not in REQUESTED status" })
    }

    console.log('Validation passed. Starting state updates... - ride.controller.js:213')
    
    // Gọi api Driver: PUT /drivers/${req.body} với {status: "COMING"} - 
    const driverUpdatePayload = {
        status: "COMING",
        current_ride_id: rideId.toString()
    }
    console.log(`1. Calling DRIVER Service to update status. Payload: - ride.controller.js:220`, driverUpdatePayload)

    await axios.put(`http://driver-service:3002/drivers/${driverId}`, driverUpdatePayload)

    console.log('Driver Service update successful. Updating RIDE status... - ride.controller.js:224')

    //ride.driverId = driverId; ride.status = "IN_PROGRESS"; update DB
    ride.driverId = driverId
    ride.status = "IN_PROGRESS"
    await ride.save()

    console.log(`2. RIDE DB Updated. Ride ID: ${rideId}, New Status: ${ride.status} - ride.controller.js:231`)

    const driver = await axios.get(`http://driver-service:3002/drivers/${driverId}`)
    const driverLocation = driver.data.location;

    console.log('END DRIVER ACCEPTANCE FLOW SUCCESS - ride.controller.js:236')
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

    console.log('START DRIVER REJECTION FLOW - ride.controller.js:253')

    const rideId = req.params.id
    const { driverId } = req.body
    
    console.log(`Received Rejection Request for Ride ID: ${rideId}, Rejected Driver ID: ${driverId} - ride.controller.js:258`)

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
    console.log(`Ride found. Current Status: ${ride.status}. Candidates before filter: ${ride.candidate_drivers.length} - ride.controller.js:272`); 

    // - verify ride.status=="REQUESTED"
    if (ride.status !== "REQUESTED") {
        console.warn(`Validation Failed: Ride status is ${ride.status}, expected REQUESTED. - ride.controller.js:276`); // LOG VALIDATION
        return res.status(400).json({ error: "Ride is not REQUESTED" })
    }

    // - Gọi api Driver: PUT /drivers/${req.body} với {status: "AVAILABLE", current_ride_id: null} - 
    const resetDriverPayload = { status: "AVAILABLE", current_ride_id: null }
    
    console.log(`1. Calling DRIVER Service to RESET rejected driver ${driverId} status to AVAILABLE. - ride.controller.js:283`)
    await axios.put(`http://driver-service:3002/drivers/${driverId}`, resetDriverPayload)
    console.log('Rejected Driver status reset successfully. - ride.controller.js:285')

    // - ride.candidate_drivers.filter 
    ride.candidate_drivers = ride.candidate_drivers.filter(
        d => d.driverId.toString() !== driverId.toString() // Giả định chuyển đổi cho an toàn
    )
    console.log(`2. Filtered candidate list. Remaining candidates: ${ride.candidate_drivers.length} - ride.controller.js:291`)

    // - kiểm tra ride.candidate_drivers.length > 0 ? tiếp tục : trả về {...}
    if (ride.candidate_drivers.length === 0) {
      ride.status = "CANCELLED"
      await ride.save()

      console.log(`3. No remaining candidates. RIDE status updated to CANCELLED. - ride.controller.js:298`)

      console.log('END DRIVER REJECTION FLOW (CANCELLED) - ride.controller.js:300')
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

    console.log(`4. Assigning next driver ${nextDriver.toString()} to ride ${rideId}. - ride.controller.js:315`)
    await axios.put(`http://driver-service:3002/drivers/${nextDriver}`, assignNextDriverPayload)
    console.log('Next driver status updated to ASSIGNED successfully. - ride.controller.js:317')

    await ride.save()

    console.log('END DRIVER REJECTION FLOW (REASSIGNED) - ride.controller.js:321')
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

    console.log(`=====Request received: PUT /rides/${rideId}/start===== - ride.controller.js:335`)

    // - ride = Query(RIDE, (req.params.id))
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" })
    }
    
    console.log('Fetched ride status: - ride.controller.js:343', ride.status, 'Driver ID:', ride.driverId)

    // - verify ride.status=="IN_PROGRESS" 
    if (ride.status !== "IN_PROGRESS") {
      return res.status(400).json({ error: "Ride not ready to start" })
    }    
    
    console.log('Ride status verified. Calling Driver Service... - ride.controller.js:350')

    console.log('Calling DRIVER Service to update status to "IN_RIDE": - ride.controller.js:352', ride.driverId)

    // - Gọi api Driver: PUT /drivers/${ride.driverId} với {status: "IN_RIDE", location: ride.startLoc} - 
    // tại đó cập nhật driver.status = "IN_RIDE", driver.location = location (vị trí tài xế = nơi đón khách), update DB
    await axios.put(`http://driver-service:3002/drivers/${ride.driverId}`, {
      status: "IN_RIDE",
      location: {
        x: ride.startLoc.x,
        y: ride.startLoc.y
      }
    })    
    
    console.log('Driver status updated successfully. - ride.controller.js:364')

    // - ride.status = "ON_TRIP", updateDB.
    ride.status = "ON_TRIP"
    await ride.save()
    console.log('Ride status updated to ON_TRIP successfully. - ride.controller.js:369')

    console.log('=====Returning 200 OK for ride: - ride.controller.js:371', rideId, "=====")
        
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
    console.log('START RIDE FINISH FLOW - ride.controller.js:386')

    const rideId = req.params.id

    console.log(`Request received: PUT /rides/${rideId}/finish - ride.controller.js:390`)

    // - ride = Query(RIDE, (req.params.id))
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" })
    }

    console.log('Fetched ride status: - ride.controller.js:398', ride.status, 'Driver ID:', ride.driverId)
    
    // - verify ride.status == "ON_TRIP"
    if (ride.status !== "ON_TRIP") {
        console.warn(`Validation Failed: Ride status is ${ride.status}, expected ON_TRIP. - ride.controller.js:402`); // LOG VALIDATION
        return res.status(400).json({ error: "Ride is not on trip" })
    }
    
    console.log('Validation passed. Starting state updates... - ride.controller.js:406')

    // - Gọi api Driver: PUT /drivers/${ride.driverId} với {status: "WAITING_FOR_PAYMENT", location: ride.endLoc} - 
    // tại đó cập nhật driver.status = "WAITING_FOR_PAYMENT", driver.location = location (vị trí tài xế = nơi trả khách), update DB

    const driverUpdatePayload = {
        status: "WAITING_FOR_PAYMENT",
        location: {
            x: ride.endLoc.x,
            y: ride.endLoc.y
        }
    }    
    
    console.log(`1. Calling DRIVER Service to update status to WAITING_FOR_PAYMENT. - ride.controller.js:419`)
    await axios.put(`http://driver-service:3002/drivers/${ride.driverId}`, driverUpdatePayload)
    console.log('Driver status updated successfully. - ride.controller.js:421')
    
    // - ride.status = "COMPLETED", update DB
    ride.status = "COMPLETED"
    await ride.save()
    console.log('2. RIDE DB Updated. Ride status set to COMPLETED. - ride.controller.js:426')

    console.log('Returning 200 OK for ride: - ride.controller.js:428', rideId)
    console.log('END RIDE FINISH FLOW - ride.controller.js:429')
    return res.json({
      rideId,
      status: "COMPLETED",
      message: "Ride finished, waiting for payment",
      driver_current_location: `(${ride.endLoc.x} ; ${ride.endLoc.y})`
    })
}

//------------------------------------------------------------------------------------------------------------------------------------------------------

export const getFare = async (req, res) => {
    try {
        const { pickup_location, dropoff_location, vehicle_type } = req.body;
        
        // Tính khoảng cách
        const dx = dropoff_location.lon - pickup_location.lon;
        const dy = dropoff_location.lat - pickup_location.lat;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Logic giá (Có thể điều chỉnh theo vehicle_type)
        const BASE_FARE = vehicle_type === 'car' ? 20000 : 10000;
        const PRICE_PER_UNIT = vehicle_type === 'car' ? 8000 : 4000;
        
        const estimated_fare = BASE_FARE + (distance * PRICE_PER_UNIT);

        return res.json({
            distance: distance.toFixed(2),
            estimated_fare: Math.round(estimated_fare),
            vehicle_type
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
