import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js'; // We'll create this constant next

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error('MONGODB connection FAILED: ', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;