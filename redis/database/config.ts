// // connect your database here
// // for example, if you are using mongoose, you can do something like this:
// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI!, {    
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     process.exit(1);
//   }

// // if you are using another database, you can connect it here

// };

// connectDB();