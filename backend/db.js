import mongoose from "mongoose";

export const mongodbConnection = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("db connected succesfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
