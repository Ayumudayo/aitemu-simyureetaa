import express from 'express';
import dotenv from 'dotenv';

import logMiddleware from './middlewares/logMiddleware.js';
import errorHandlingMiddleware from './middlewares/errorHandlingMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import rankRoutes from './routes/rankRoutes.js';

dotenv.config();
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/rank', rankRoutes);

app.use(errorHandlingMiddleware);

app.get('/', (req, res) => {
  res.send('Item Simulator API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
