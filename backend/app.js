import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use(urlencoded(
            { 
                extended: true,
                limit: '16kb'
            })
        );
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(cookieParser());

export default app;
