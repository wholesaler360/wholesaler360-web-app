import app from './app.js';
import 'dotenv/config';

const PORT = process.env.PORT;
const localhost = "127.0.0.1"


app.get('/',(req,res)=>{
    res.status(200).send("This is server listening")
})

// Return Page not found for all other routes
app.get('/*',(req,res)=>{
    res.status(404).send("Page Not Found")
})

app.listen(PORT, localhost, () => {
    console.log(`Server running at http://${localhost}:${PORT}`);
});
