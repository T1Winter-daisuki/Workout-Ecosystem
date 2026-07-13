import 'dotenv/config';
import dns from 'node:dns';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRouter from './2_auth/auth.routes';

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

// Route không tồn tại
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Không tìm thấy endpoint' });
});

// Error handler tập trung
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Dữ liệu JSON không hợp lệ' });
  }
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || 'Đã có lỗi xảy ra' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});