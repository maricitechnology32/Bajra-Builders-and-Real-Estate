import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    // A reference to the user booking the appointment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // A reference to the property for the visit
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    // The requested date and time for the appointment
    appointmentDate: {
      type: Date,
      required: true,
    },
    // Status for admin management
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
    // Optional notes from the user or for the admin
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);