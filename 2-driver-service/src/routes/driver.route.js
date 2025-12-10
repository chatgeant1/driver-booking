import { Router } from "express";
import * as ctl from "../controllers/driver.controller.js"

const router = Router()

// "/drivers/(*)"
router.get("/", ctl.getAll)
router.get("/health", ctl.health)

//GET /drivers/nearby-driver-list?user_x=21.05&user_y=105.82
router.get("/nearby-driver-list", ctl.get_nearby_list);

router.get("/:id", ctl.getOne)


router.post("/", ctl.create)
router.put("/:id", ctl.update)
router.delete("/:id", ctl.remove)

export default router



// // Cập nhật vị trí (Real-time)
// // input: Latitude, Longitude, Timestamp.
// // output: driverId, status: [success, failed]
// app.put('/drivers/:id/location', ()=>{})

// // Tìm Tài xế (Gọi từ Ride Service).
// // input: current_latitude, current_longitude, radius_km
// // output: Danh sách driver, distance_m.
// app.get('/drivers/search', () => {})

// // Gửi yêu cầu chuyến đi (Gọi từ Ride Service)
// // ride_id, Vị trí đón (pickup_loc), Vị trí đến (dest_loc)
// // driverId, request_status: pending
// app.post('/drivers/:id/request', () => {})
