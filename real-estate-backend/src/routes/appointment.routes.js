import { Router } from 'express';
import {
  createAppointment,
  getUserAppointments,
  getAllAppointmentsForAdmin,
  updateAppointment,
} from '../controllers/appointment.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply login check to all routes in this file
router.use(verifyJWT);

// --- Routes for Regular Users ---
router.route('/').post(createAppointment);      // A user can create an appointment
router.route('/').get(getUserAppointments);     // A user can view their own appointments

// --- Routes for Admins Only ---
router.route('/all').get(verifyRole(['ADMIN']), getAllAppointmentsForAdmin); // An admin gets all appointments
router.route('/:id').patch(verifyRole(['ADMIN']), updateAppointment);        // An admin updates an appointment

export default router;