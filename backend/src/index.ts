import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import transactionRoutes from './routes/transactions';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the FinTech Transaction Dashboard API!' });
});

app.use('/api/v1', transactionRoutes);

async function start() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();

export default app;
