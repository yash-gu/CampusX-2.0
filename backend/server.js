import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import productRoutes from './routes/products.js';
import chatRoutes from './routes/chat.js';
import uploadRoutes from './routes/upload.js';
import documentUploadRoutes from './routes/documentUpload.js';
import publicUploadRoutes from './routes/publicUpload.js';
import eventRoutes from './routes/events.js';
import studyResourceRoutes from './routes/studyResources.js';
import qrRoutes from './routes/qr.js';
import socketHandler from './socket/socketHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload', documentUploadRoutes);
app.use('/api/public-upload', publicUploadRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/study-resources', studyResourceRoutes);
app.use('/api/qr', qrRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/documents', express.static(path.join(__dirname, 'uploads', 'documents')));

app.get('/', (req, res) => {
  res.json({ message: 'CampusX API Server Running' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

socketHandler(io);

export { io };
