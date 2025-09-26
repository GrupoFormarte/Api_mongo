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
const express_1 = require("express");
const StudentService_1 = require("../../../../application/services/StudentService");
const errorHandler_1 = require("../../../../shared/middleware/errorHandler");
const ApiResponse_1 = __importDefault(require("../../../../shared/utils/ApiResponse"));
const router = (0, express_1.Router)();
const studentService = new StudentService_1.StudentService();
// Get student position in ranking
router.get('/position/:grado/:id_student', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_student, grado } = req.params;
    const result = yield studentService.getStudentPosition(grado, id_student);
    return ApiResponse_1.default.success(res, result, 'Student position retrieved successfully');
})));
// Bulk update students
router.put('/:collectionName/bulk-update', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName } = req.params;
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
        return ApiResponse_1.default.badRequest(res, 'Se requiere un array de estudiantes para actualizar');
    }
    const result = yield studentService.updateStudentsBulk(collectionName, students);
    return ApiResponse_1.default.bulk(res, {
        successful: result.updated,
        failed: result.notFound.map(id => ({ id, reason: 'Not found' })),
        total: students.length
    }, 'Bulk update completed');
})));
// Bulk create unique students
router.post('/:collectionName/bulk-create-unique', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName } = req.params;
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
        return ApiResponse_1.default.badRequest(res, 'Se requiere un array de estudiantes');
    }
    const result = yield studentService.createStudentsUnique(collectionName, students);
    return ApiResponse_1.default.bulk(res, {
        successful: result.created,
        failed: result.existing.map((student) => ({
            id: student.id_estudiante,
            reason: 'Already exists'
        })),
        total: students.length
    }, 'Bulk create completed');
})));
// Get student by ID
router.get('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const result = yield studentService.getStudentById(collectionName, id);
    if (!result) {
        return ApiResponse_1.default.notFound(res, 'Estudiante no encontrado');
    }
    return ApiResponse_1.default.success(res, result, 'Student retrieved successfully');
})));
// Get student by student ID
router.get('/:collectionName/by-student-id/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const result = yield studentService.getStudentByStudentId(collectionName, id);
    if (!result) {
        return ApiResponse_1.default.notFound(res, 'Estudiante no encontrado');
    }
    return ApiResponse_1.default.success(res, result, 'Student retrieved successfully');
})));
// Update student
router.put('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const data = req.body;
    const result = yield studentService.updateStudent(collectionName, id, data);
    if (!result) {
        return ApiResponse_1.default.notFound(res, 'Estudiante no encontrado');
    }
    return ApiResponse_1.default.updated(res, result, 'Student updated successfully');
})));
// Delete student
router.delete('/:collectionName/:id', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const result = yield studentService.deleteStudent(collectionName, id);
    if (!result) {
        return ApiResponse_1.default.notFound(res, 'Estudiante no encontrado');
    }
    return ApiResponse_1.default.deleted(res, 'Student deleted successfully');
})));
// Get all students
router.get('/:collectionName', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = yield studentService.getAllStudents(collectionName);
    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResult = result.slice(startIndex, endIndex);
    return ApiResponse_1.default.paginated(res, paginatedResult, page, limit, result.length, 'Students retrieved successfully');
})));
// Create student
router.post('/:collectionName/:id?', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionName, id } = req.params;
    const data = req.body.data || req.body;
    const idAux = id !== null && id !== void 0 ? id : data.id_student;
    const result = yield studentService.createStudent(collectionName, data, idAux);
    return ApiResponse_1.default.created(res, result, 'Student created successfully');
})));
exports.default = router;
