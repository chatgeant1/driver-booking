import express from 'express'
import * as ctl from '../controllers/ride.controller.js'
const router = express.Router();

router.get("/", ctl.getAll)
router.get("/health", ctl.health)
router.get("/:id", ctl.getOne)

router.post("/", ctl.create)

router.put("/:id", ctl.update)

router.delete("/:id", ctl.remove)

router.post("/:id/accept", ctl.driver_accept)
router.post("/:id/reject", ctl.driver_reject)
router.put("/:id/start", ctl.start)
router.put("/:id/finish", ctl.finish)

router.post("/fare", ctl.getFare); // Thêm dòng này để khớp với API gọi từ React

export default router
