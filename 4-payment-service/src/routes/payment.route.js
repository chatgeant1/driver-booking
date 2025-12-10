import express from 'express'
import * as ctl from '../controllers/payment.controller.js'
const router = express.Router();

router.get("/", ctl.getAll)
router.get("/health", ctl.health)
router.get("/:id", ctl.getOne)

router.post("/", ctl.create)
router.put("/:id", ctl.update)
router.delete("/:id", ctl.remove)

// Payments by user (history)
// router.get('/payments/user/:userId', controller.getPaymentsByUser);


export default router
