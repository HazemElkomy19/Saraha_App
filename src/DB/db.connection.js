import mongoose from "mongoose";
const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
};
export default dbConnection;