import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';

const router = Router();

router.get('/transactions', transactionController.index);
router.get('/transactions/grid', transactionController.grid);
router.get('/transactions/:id', transactionController.show);
router.post('/transactions', transactionController.create);
router.put('/transactions/:id', transactionController.update);
router.delete('/transactions/:id', transactionController.delete);

export default router;
