import 'dotenv/config'
import  app  from './app.js'
import connectDB from './db/index.js';

const localhost = "127.0.0.1"
const port = process.env.PORT;

connectDB()
.then(()=>{

    app.listen(port,()=>{
        console.log(`Server is running...http://${localhost}:${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongodb Connection Error",err);
    process.exit(1);
})

