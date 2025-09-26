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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DynamicRepository_1 = require("../../../../infrastructure/repositories/DynamicRepository");
const errorHandler_1 = require("../../../../shared/middleware/errorHandler");
const router = (0, express_1.Router)();
const repository = new DynamicRepository_1.DynamicRepository();
// Get documents by IDs in bulk (generic)
router.post('/:collectionName/bulk', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName } = req.params;
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new errorHandler_1.AppError('Se requiere un array "ids" con al menos un elemento', 400);
    }
    const documents = yield repository.findByIds(collectionName, ids);
    if (!documents || documents.length === 0) {
        throw new errorHandler_1.AppError('No se encontraron documentos para los IDs especificados', 404);
    }
    res.status(200).json(documents);
})));
// Search documents by dynamic field
router.get('/:collectionName/search/:field/:value', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, field, value } = req.params;
    const documents = yield repository.searchByField(collectionName, field, value);
    if (documents.length === 0) {
        throw new errorHandler_1.AppError(`No se encontraron documentos para el campo "${field}" con el valor "${value}"`, 404);
    }
    res.status(200).json(documents);
})));
// Multi-field search
router.get('/:collectionName/multi-search/:query', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, query } = req.params;
    const fields = req.query.fields ? req.query.fields.split(',') : [];
    if (fields.length === 0) {
        throw new errorHandler_1.AppError('Se requiere al menos un campo en el parámetro "fields"', 400);
    }
    const documents = yield repository.multiFieldSearch(collectionName, query, fields);
    res.status(200).json(documents);
})));
// Search by category
router.get('/:collectionName/category/:category', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, category } = req.params;
    const documents = yield repository.findByCategory(collectionName, category);
    res.status(200).json(documents);
})));
// Get all documents from a collection
router.get('/:collectionName', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName } = req.params;
    const documents = yield repository.find(collectionName);
    res.status(200).json(documents);
})));
// Get document by ID
router.get('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const document = yield repository.findById(collectionName, id);
    if (!document) {
        throw new errorHandler_1.AppError('Documento no encontrado', 404);
    }
    res.status(200).json(document);
})));
// Create document
router.post('/:collectionName/:id?', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const schemaDefinition = req.body.schema || {};
    const data = req.body.data || req.body;
    const idAux = id !== null && id !== void 0 ? id : data.id_student;
    const documentData = idAux ? Object.assign(Object.assign({}, data), { id: idAux }) : data;
    const document = yield repository.create(collectionName, documentData, schemaDefinition);
    res.status(201).json(document);
})));
// Update document by ID
router.put('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const data = req.body;
    const document = yield repository.updateById(collectionName, id, data);
    if (!document) {
        throw new errorHandler_1.AppError('Documento no encontrado', 404);
    }
    res.status(200).json(document);
})));
// Delete document by ID
router.delete('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const document = yield repository.deleteById(collectionName, id);
    if (!document) {
        throw new errorHandler_1.AppError('Documento no encontrado', 404);
    }
    res.status(200).json(document);
})));
exports.default = router;
