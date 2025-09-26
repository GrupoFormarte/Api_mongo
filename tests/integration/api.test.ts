import request from 'supertest';
import express from 'express';
import { ResponseHandler } from '../../src/shared/utils/responseHandler';

// Mock app setup for integration tests
const app = express();
app.use(express.json());

// Test routes
app.get('/test/success', (req, res) => {
  ResponseHandler.success(res, { message: 'Test successful' });
});

app.get('/test/error', (req, res) => {
  ResponseHandler.error(res, new Error('Test error'));
});

app.get('/test/not-found', (req, res) => {
  ResponseHandler.notFound(res, 'Resource not found');
});

app.get('/test/bad-request', (req, res) => {
  ResponseHandler.badRequest(res, 'Invalid request');
});

describe('API Integration Tests', () => {
  describe('ResponseHandler Integration', () => {
    it('should handle success responses', async () => {
      const response = await request(app)
        .get('/test/success')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Operation successful',
        data: { message: 'Test successful' },
      });
    });

    it('should handle error responses', async () => {
      const response = await request(app)
        .get('/test/error')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'An error occurred',
        error: 'Test error',
      });
    });

    it('should handle not found responses', async () => {
      const response = await request(app)
        .get('/test/not-found')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Resource not found',
        error: null,
      });
    });

    it('should handle bad request responses', async () => {
      const response = await request(app)
        .get('/test/bad-request')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid request',
        error: null,
      });
    });
  });
});