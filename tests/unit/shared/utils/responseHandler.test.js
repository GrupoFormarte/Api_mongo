"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseHandler_1 = require("../../../../src/shared/utils/responseHandler");
describe('ResponseHandler', () => {
    let mockRes;
    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });
    describe('success', () => {
        it('should return success response with default values', () => {
            const data = { id: 1, name: 'Test' };
            responseHandler_1.ResponseHandler.success(mockRes, data);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Operation successful',
                data,
            });
        });
        it('should return success response with custom message and status code', () => {
            const data = { id: 1 };
            const message = 'Created successfully';
            const statusCode = 201;
            responseHandler_1.ResponseHandler.success(mockRes, data, message, statusCode);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message,
                data,
            });
        });
    });
    describe('error', () => {
        it('should return error response with default values', () => {
            const error = new Error('Test error');
            responseHandler_1.ResponseHandler.error(mockRes, error);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'An error occurred',
                error: 'Test error',
            });
        });
        it('should handle non-Error objects', () => {
            const error = 'String error';
            responseHandler_1.ResponseHandler.error(mockRes, error);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'An error occurred',
                error: 'String error',
            });
        });
        it('should return error response with custom message and status code', () => {
            const error = new Error('Custom error');
            const message = 'Custom message';
            const statusCode = 400;
            responseHandler_1.ResponseHandler.error(mockRes, error, message, statusCode);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message,
                error: 'Custom error',
            });
        });
    });
    describe('badRequest', () => {
        it('should return bad request response with default message', () => {
            responseHandler_1.ResponseHandler.badRequest(mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bad request',
                error: null,
            });
        });
        it('should return bad request response with custom message', () => {
            const message = 'Invalid input';
            responseHandler_1.ResponseHandler.badRequest(mockRes, message);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message,
                error: null,
            });
        });
    });
    describe('notFound', () => {
        it('should return not found response with default message', () => {
            responseHandler_1.ResponseHandler.notFound(mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not found',
                error: null,
            });
        });
        it('should return not found response with custom message', () => {
            const message = 'User not found';
            responseHandler_1.ResponseHandler.notFound(mockRes, message);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message,
                error: null,
            });
        });
    });
});
