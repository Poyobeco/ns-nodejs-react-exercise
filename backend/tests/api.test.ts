import request from 'supertest';
import { sequelize } from '../src/config/database';

const baseUrl = 'http://localhost:8000';

describe('API Tests', () => {
  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /health', () => {
    it('should return ok status', async () => {
      const response = await request(baseUrl).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should return all transactions', async () => {
      const response = await request(baseUrl).get('/api/v1/transactions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(25);
    });

    it('should support pagination', async () => {
      const response = await request(baseUrl)
        .get('/api/v1/transactions')
        .query({ skip: 5, limit: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(10);
    });
  });

  describe('GET /api/v1/transactions/:id', () => {
    it('should return a single transaction', async () => {
      const response = await request(baseUrl).get('/api/v1/transactions/1');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.description).toBe('Groceries');
      expect(response.body.category_rel).toBeDefined();
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(baseUrl).get('/api/v1/transactions/99999');

      expect(response.status).toBe(404);
      expect(response.body.detail).toBe('Transaction not found');
    });
  });

  describe('Amount serialization', () => {
    it('should serialize amount as number', async () => {
      const response = await request(baseUrl).get('/api/v1/transactions/1');

      expect(response.status).toBe(200);
      expect(typeof response.body.amount).toBe('number');
      expect(response.body.amount).toBe(50.25);
    });
  });

  describe('POST /api/v1/transactions', () => {
    it('should create a new transaction', async () => {
      const newTransaction = {
        description: 'Test Transaction',
        amount: 123.45,
        type: 'debit',
        category_id: 1,
        user_id: 1
      };

      const response = await request(baseUrl)
        .post('/api/v1/transactions')
        .send(newTransaction);

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Test Transaction');
      expect(response.body.amount).toBe(123.45);
      expect(typeof response.body.amount).toBe('number');
      expect(response.body.category_rel).toBeDefined();
    });

    it('should return 422 for invalid transaction', async () => {
      const invalidTransaction = {
        description: '',
        amount: 50.0
      };

      const response = await request(baseUrl)
        .post('/api/v1/transactions')
        .send(invalidTransaction);

      expect(response.status).toBe(422);
      expect(response.body.detail).toBeDefined();
    });
  });

  describe('PUT /api/v1/transactions/:id', () => {
    it('should update a transaction', async () => {
      const updates = {
        description: 'Updated Transaction',
        amount: 999.99,
        type: 'credit',
        category_id: 1,
        user_id: 1
      };

      const response = await request(baseUrl)
        .put('/api/v1/transactions/1')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated Transaction');
      expect(response.body.amount).toBe(999.99);
      expect(response.body.category_rel).toBeDefined();
    });

    it('should return 404 for non-existent transaction', async () => {
      const updates = {
        description: 'Updated',
        amount: 100.0,
        type: 'debit',
        category_id: 1,
        user_id: 1
      };

      const response = await request(baseUrl)
        .put('/api/v1/transactions/99999')
        .send(updates);

      expect(response.status).toBe(404);
      expect(response.body.detail).toBe('Transaction not found');
    });
  });

  describe('DELETE /api/v1/transactions/:id', () => {
    it('should delete a transaction', async () => {
      const newTransaction = {
        description: 'To Be Deleted',
        amount: 50.0,
        type: 'debit',
        category_id: 1,
        user_id: 1
      };

      const createResponse = await request(baseUrl)
        .post('/api/v1/transactions')
        .send(newTransaction);

      const transactionId = createResponse.body.id;

      const deleteResponse = await request(baseUrl)
        .delete(`/api/v1/transactions/${transactionId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.id).toBe(transactionId);
      expect(deleteResponse.body.description).toBe('To Be Deleted');
      expect(deleteResponse.body.category_rel).toBeDefined();
      expect(typeof deleteResponse.body.amount).toBe('number');

      const getResponse = await request(baseUrl)
        .get(`/api/v1/transactions/${transactionId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(baseUrl)
        .delete('/api/v1/transactions/99999');

      expect(response.status).toBe(404);
      expect(response.body.detail).toBe('Transaction not found');
    });
  });

  describe('CORS', () => {
    it('should have CORS headers', async () => {
      const response = await request(baseUrl)
        .options('/api/v1/transactions')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
