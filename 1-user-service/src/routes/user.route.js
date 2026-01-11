import { Router } from "express";
import * as ctl from '../controllers/user.controller.js' 

const router = Router()

// "/users/(*)"
router.get("/", ctl.getAll)
router.get("/health", ctl.health)
router.get("/:id", ctl.getOne)

router.post("/", ctl.create)
router.put("/:id", ctl.update)
router.delete("/:id", ctl.remove)

export default router

// // Lấy lịch sử chuyến đi của người dùng
// // => Danh sách ride_id và trạng thái cơ bản.
// app.get('/users/:id/rides', (req, res) => {})


