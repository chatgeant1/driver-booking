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

// // Update status
// router.patch('/:id/status', controller.updateRideStatus);

// // Assign driver
// router.post('/:id/assign', controller.assignDriver);

// // Optional: cancel endpoint (maps to status update to 'cancelled')
// router.put('/:id/cancel', async (req, res, next) => {
//     try {
//         req.body = req.body || {};
//         req.body.status = 'cancelled';
//         return controller.updateRideStatus(req, res, next);
//     } catch (err) {
//         next(err);
//     }
// });



export default router
