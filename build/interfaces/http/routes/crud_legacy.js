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
const AcademicService_1 = require("../../../application/services/AcademicService");
const StudentService_1 = require("../../../application/services/StudentService");
const DynamicRepository_1 = require("../../../infrastructure/repositories/DynamicRepository");
const errorHandler_1 = require("../../../shared/middleware/errorHandler");
const router = (0, express_1.Router)();
const academicService = new AcademicService_1.AcademicService();
const studentService = new StudentService_1.StudentService();
const repository = new DynamicRepository_1.DynamicRepository();
// ================================================
// LEGACY CRUD OPERATIONS - USING NEW SERVICES
// ================================================
// Obtener áreas por IDs en bulk
router.post('/get-areas/bulk', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { grado, ids } = req.body;
    const result = yield academicService.getAreasByIds(grado, ids);
    res.status(200).json(result);
})));
// Obtener asignaturas por IDs en bulk
router.post('/get-asignatures/bulk', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { grado, ids } = req.body;
    const result = yield academicService.getSubjectsByIds(grado, ids);
    res.status(200).json(result);
})));
// Obtener documentos por IDs en bulk (genérico)
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
// Actualizar múltiples documentos
router.put('/:collectionName/bulk-update', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName } = req.params;
    const { students } = req.body;
    const result = yield studentService.updateStudentsBulk(collectionName, students);
    res.status(200).json({
        message: `${result.updated.length} estudiantes actualizados.`,
        actualizados: result.updated,
        no_encontrados: result.notFound
    });
})));
// Crear múltiples documentos (solo si no existen)
router.post('/:collectionName/bulk-create-unique', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName } = req.params;
    const { students } = req.body;
    const result = yield studentService.createStudentsUnique(collectionName, students);
    res.status(200).json({
        message: `${result.created.length} estudiantes creados. ${result.existing.length} ya existían.`,
        creados: result.created,
        existentes: result.existing
    });
})));
// Buscar documentos por campo dinámico
router.get('/:collectionName/search/:field/:value', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, field, value } = req.params;
    const documents = yield repository.searchByField(collectionName, field, value);
    if (documents.length === 0) {
        throw new errorHandler_1.AppError(`No se encontraron documentos para el campo "${field}" con el valor "${value}"`, 404);
    }
    res.status(200).json(documents);
})));
// Buscar documentos por múltiples campos
router.get('/:collectionName/multi-search/:query', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, query } = req.params;
    const fields = req.query.fields ? req.query.fields.split(',') : [];
    const documents = yield repository.multiFieldSearch(collectionName, query, fields);
    res.status(200).json(documents);
})));
// Buscar por categoría
router.get('/:collectionName/category/:category', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, category } = req.params;
    const documents = yield repository.findByCategory(collectionName, category);
    res.status(200).json(documents);
})));
// Crear documento (con o sin ID específico)
router.post('/:collectionName/:id?', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const data = req.body.data || req.body;
    const result = yield studentService.createStudent(collectionName, data, id);
    res.status(201).json(result);
})));
// Generar simulacro
router.get('/generate-simulacro/:value/:cantidad', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { value, cantidad } = req.params;
    const result = yield academicService.generateSimulacro(value, cantidad);
    res.status(200).json(result);
})));
// Obtener asignatura por ID
router.get('/get-asignatures/:idAsignature/:valueGrado', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idAsignature, valueGrado } = req.params;
    const result = yield academicService.getSubjectById(idAsignature, valueGrado);
    if (!result) {
        throw new errorHandler_1.AppError('Asignatura no encontrada', 404);
    }
    res.status(200).json(result);
})));
// Obtener todos los documentos de una colección
router.get('/:collectionName', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName } = req.params;
    const documents = yield repository.find(collectionName);
    res.status(200).json(documents);
})));
// Obtener pregunta específica
router.get('/get-questions/:idquestion/:idProgram?', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idquestion } = req.params;
    const result = yield academicService.getQuestionById(idquestion);
    if (!result) {
        throw new errorHandler_1.AppError('Pregunta no encontrada', 404);
    }
    res.status(200).json(result);
})));
// Obtener documento por ID
router.get('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const document = yield repository.findById(collectionName, id);
    if (!document) {
        throw new errorHandler_1.AppError('Documento no encontrado', 404);
    }
    res.status(200).json(document);
})));
// Obtener documento por ID de estudiante
router.get('/:collectionName/convert_id/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const document = yield studentService.getStudentByStudentId(collectionName, id);
    if (!document) {
        throw new errorHandler_1.AppError('Estudiante no encontrado', 404);
    }
    res.status(200).json(document);
})));
// Obtener posición del estudiante en ranking
router.get('/get-my-position/:grado/:id_student', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_student, grado } = req.params;
    const result = yield studentService.getStudentPosition(grado, id_student);
    res.status(200).json(result);
})));
// Actualizar documento por ID
router.put('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const data = req.body;
    const document = yield repository.updateById(collectionName, id, data);
    if (!document) {
        throw new errorHandler_1.AppError('Documento no encontrado', 404);
    }
    res.status(200).json(document);
})));
// Eliminar documento por ID
router.delete('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const document = yield repository.deleteById(collectionName, id);
    if (!document) {
        throw new errorHandler_1.AppError('Documento no encontrado', 404);
    }
    res.status(200).json(document);
})));
// Obtener preguntas por tipo y área
router.get('/preguntas-por-tipo/:idPrograma/:type/:value', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idPrograma, value } = req.params;
    const result = yield academicService.getQuestionsByTypeAndArea(idPrograma, value);
    res.status(200).json(result);
})));
// Obtener nivel académico por puntaje
router.get('/:collectionName/:id/:score', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id, score } = req.params;
    const result = yield academicService.getAcademicLevelByScore(collectionName, id, score);
    res.status(200).json(result);
})));
exports.default = router;
