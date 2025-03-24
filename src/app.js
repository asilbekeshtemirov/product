import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/mongoose.config.js';
import routes from './routes/index.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use('/api', routes);

export default app;
