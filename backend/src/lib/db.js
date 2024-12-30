import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB connected");
    } catch (error) {
        crossOriginIsolated.log("DB connection error: ",error);
    }
}