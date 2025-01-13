import mongoose from 'mongoose'
import { DB_NAME } from '../contants.js'

const connectDB = async () => {
    try {
        const connectionInstance = await(mongoose.connect(`${process.env.URI}/${DB_NAME}`))
        console.log("Connection Establised Sucsessfully",`DB_host: ${connectionInstance.connection.host}`)  
        // console.log("AA Await chhe");
    } catch (error) {
        // api/db/index.js focuses on database-specific issues.
        console.log("Mongodb Connection not established",error);
        process.exit(1);
    }
}

export default connectDB;