import mongoose from "mongoose";


const connectDatabase = async () => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/desta1', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
