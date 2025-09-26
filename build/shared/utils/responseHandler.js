"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHandler = void 0;
class ResponseHandler {
    static success(res, data, message = 'Operation successful', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static error(res, error, message = 'An error occurred', statusCode = 500) {
        return res.status(statusCode).json({
            success: false,
            message,
            error: error instanceof Error ? error.message : error,
        });
    }
    static badRequest(res, message = 'Bad request') {
        return this.error(res, null, message, 400);
    }
    static notFound(res, message = 'Not found') {
        return this.error(res, null, message, 404);
    }
}
exports.ResponseHandler = ResponseHandler;
