"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';
    let details = err.details;
    // MongoDB validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Error de validación';
        details = err.message;
    }
    // MongoDB cast errors (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'ID inválido';
    }
    // MongoDB duplicate key error
    if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        message = 'Registro duplicado';
        details = 'Ya existe un registro con estos datos';
    }
    // Log error for debugging (in production, use a proper logger)
    if (statusCode >= 500) {
        console.error('Server Error:', {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query
        });
    }
    res.status(statusCode).json(Object.assign(Object.assign({ error: message }, (details && { details })), (process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        message: `No se encontró la ruta ${req.method} ${req.path}`
    });
};
exports.notFoundHandler = notFoundHandler;
