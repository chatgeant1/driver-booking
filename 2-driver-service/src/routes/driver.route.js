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
