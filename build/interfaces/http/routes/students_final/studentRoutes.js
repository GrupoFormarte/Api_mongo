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
const StudentService_1 = require("../../../../application/services/StudentService");
const errorHandler_1 = require("../../../../shared/middleware/errorHandler");
const router = (0, express_1.Router)();
const studentService = new StudentService_1.StudentService();
// Get student position in ranking
router.get('/position/:grado/:id_student', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_student, grado } = req.params;
    const result = yield studentService.getStudentPosition(grado, id_student);
    res.status(200).json(result);
})));
// Bulk update students
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
// Bulk create unique students
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
// Get student by ID
router.get('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const result = yield studentService.getStudentById(collectionName, id);
    if (!result) {
        throw new errorHandler_1.AppError('Estudiante no encontrado', 404);
    }
    res.status(200).json(result);
})));
// Get student by student ID
router.get('/:collectionName/by-student-id/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const result = yield studentService.getStudentByStudentId(collectionName, id);
    if (!result) {
        throw new errorHandler_1.AppError('Estudiante no encontrado', 404);
    }
    res.status(200).json(result);
})));
// Update student
router.put('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const data = req.body;
    const result = yield studentService.updateStudent(collectionName, id, data);
    if (!result) {
        throw new errorHandler_1.AppError('Estudiante no encontrado', 404);
    }
    res.status(200).json(result);
})));
// Delete student
router.delete('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const result = yield studentService.deleteStudent(collectionName, id);
    if (!result) {
        throw new errorHandler_1.AppError('Estudiante no encontrado', 404);
    }
    res.status(200).json(result);
})));
// Get all students
router.get('/:collectionName', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName } = req.params;
    const result = yield studentService.getAllStudents(collectionName);
    res.status(200).json(result);
})));
// Create student
router.post('/:collectionName/:id?', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const data = req.body.data || req.body;
    const idAux = id !== null && id !== void 0 ? id : data.id_student;
    const result = yield studentService.createStudent(collectionName, data, idAux);
    res.status(201).json(result);
})));
exports.default = router;
