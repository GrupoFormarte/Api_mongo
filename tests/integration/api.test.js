"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const responseHandler_1 = require("../../src/shared/utils/responseHandler");
// Mock app setup for integration tests
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Test routes
app.get('/test/success', (req, res) => {
    responseHandler_1.ResponseHandler.success(res, { message: 'Test successful' });
});
app.get('/test/error', (req, res) => {
    responseHandler_1.ResponseHandler.error(res, new Error('Test error'));
});
app.get('/test/not-found', (req, res) => {
    responseHandler_1.ResponseHandler.notFound(res, 'Resource not found');
});
app.get('/test/bad-request', (req, res) => {
    responseHandler_1.ResponseHandler.badRequest(res, 'Invalid request');
});
describe('API Integration Tests', () => {
    describe('ResponseHandler Integration', () => {
        it('should handle success responses', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/test/success')
                .expect(200);
            expect(response.body).toEqual({
                success: true,
                message: 'Operation successful',
                data: { message: 'Test successful' },
            });
        }));
        it('should handle error responses', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/test/error')
                .expect(500);
            expect(response.body).toEqual({
                success: false,
                message: 'An error occurred',
                error: 'Test error',
            });
        }));
        it('should handle not found responses', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/test/not-found')
                .expect(404);
            expect(response.body).toEqual({
                success: false,
                message: 'Resource not found',
                error: null,
            });
        }));
        it('should handle bad request responses', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/test/bad-request')
                .expect(400);
            expect(response.body).toEqual({
                success: false,
                message: 'Invalid request',
                error: null,
            });
        }));
    });
});
