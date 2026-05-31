import 'dotenv/config';
import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import authRouter from './2_auth/auth.routes';
import { Request, Response } from 'express';

dns.setDefaultResultOrder('ipv4first');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});