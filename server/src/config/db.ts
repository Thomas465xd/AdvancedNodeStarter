import mongoose from "mongoose";
import colors from "colors";
import { exit } from "process";
import { getKeys } from "./keys.js";

export const connectDB = async () => {
    try {
        const keys = await getKeys(); 
        const connection = await mongoose.connect(keys.mongoURI);
        const url = `${connection.connection.host}:${connection.connection.port}`

        console.log(
            colors.cyan.bold(`MongoDB connected: ${url}`)
        )
    } catch (error) {
        console.log(colors.red.bold(`Error connecting to MongoDB: ${error}`)); 
        exit(1);
    }
}