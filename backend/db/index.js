import mongoose from "mongoose";


const DB_NAME = "chatapptest";

const connectDB = async () => {
  
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(`\n MongoDB Connected !!`);
  } catch (error) {
    console.log("MONGODB could not be connected :", error);
    process.exit(1); //diff ways to exit code in NodeJs
  }
};

export default connectDB;
