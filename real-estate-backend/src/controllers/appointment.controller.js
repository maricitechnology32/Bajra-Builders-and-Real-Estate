import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Appointment } from '../models/appointment.model.js';
import { Property } from '../models/property.model.js';


const createAppointment = asyncHandler(async (req, res) => {
  const { propertyId, appointmentDate, notes } = req.body;
  const userId = req.user._id;

  if (!propertyId || !appointmentDate) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  // Validate the date
  const date = new Date(appointmentDate);
  if (isNaN(date.getTime())) {
    throw new ApiError(400, req.t('errorInvalidAppointmentDate'));
  }
  if (date < new Date()) {
    throw new ApiError(400, req.t('errorAppointmentInPast'));
  }

  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  const appointment = await Appointment.create({
    property: propertyId,
    user: userId,
    appointmentDate: date,
    notes,
  });

  return res.status(201).json(
    new ApiResponse(201, appointment, req.t('appointmentBookedSuccess'))
  );
});


const getUserAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate('property', 'title images locationAddress')
    .sort({ appointmentDate: -1 });

  return res.status(200).json(
    new ApiResponse(200, appointments, req.t('appointmentsFetchedSuccess'))
  );
});


const getAllAppointmentsForAdmin = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate('property', 'title locationAddress')
    .populate('user', 'fullName email')
    .sort({ appointmentDate: -1 });

  return res.status(200).json(
    new ApiResponse(200, appointments, req.t('appointmentsFetchedSuccess'))
  );
});


const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, appointmentDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid appointment ID');
  }

  const updateData = {};
  if (status) {
    const allowedStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400, req.t('errorInvalidStatus'));
    }
    updateData.status = status;
  }

  if (appointmentDate) {
    const date = new Date(appointmentDate);
    if (isNaN(date.getTime())) {
      throw new ApiError(400, req.t('errorInvalidAppointmentDate'));
    }
    updateData.appointmentDate = date;
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );

  if (!updatedAppointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  return res.status(200).json(
    new ApiResponse(200, updatedAppointment, req.t('appointmentUpdatedSuccess'))
  );
});

export {
  createAppointment,
  getUserAppointments,
  getAllAppointmentsForAdmin,
  updateAppointment,
};