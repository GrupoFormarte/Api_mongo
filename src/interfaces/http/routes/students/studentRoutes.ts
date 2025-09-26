import { Router, Request, Response } from 'express';
import { StudentService } from '../../../../application/services/StudentService';
import { asyncHandler } from '../../../../shared/middleware/errorHandler';
import ApiResponse from '../../../../shared/utils/ApiResponse';

const router = Router();
const studentService = new StudentService();

// Get student by id_estudiante query parameter (without collection)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { id_estudiante } = req.query;


  if (id_estudiante) {
    const result = await studentService.getStudentByStudentId('students', id_estudiante as string);
    if (!result) {
      return ApiResponse.notFound(res, 'Estudiante no encontrado');
    }
    return ApiResponse.success(res, result, 'Student retrieved successfully');
  }

  // If no id_estudiante query, return all students with pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const result = await studentService.getAllStudents('students');
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResult = result.slice(startIndex, endIndex);

  return ApiResponse.paginated(res, paginatedResult, page, limit, result.length, 'Students retrieved successfully');
}));

// Get student position in ranking
router.get('/position/:grado/:id_student', asyncHandler(async (req: Request, res: Response) => {
  const { id_student, grado } = req.params;

  const result = await studentService.getStudentPosition(grado, id_student);
  return ApiResponse.success(res, result, 'Student position retrieved successfully');
}));

// Bulk update students
router.put('/bulk-update', asyncHandler(async (req: Request, res: Response) => {

  const { updates } = req.body;
const students= updates;
  if (!Array.isArray(students) || students.length === 0) {
    return ApiResponse.badRequest(res, 'Se requiere un array de estudiantes para actualizar');
  }

  const result = await studentService.updateStudentsBulk("students", students);
  
  return ApiResponse.bulk(res, {
    successful: result.updated,
    failed: result.notFound.map(id => ({ id, reason: 'Not found' })),
    total: students.length
  }, 'Bulk update completed');
}));

// Bulk create unique students
router.post('/bulk-create-unique', asyncHandler(async (req: Request, res: Response) => {

  const { students } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return ApiResponse.badRequest(res, 'Se requiere un array de estudiantes');
  }


  
  
  const result = await studentService.createStudentsUnique('students', students);

  return ApiResponse.bulk(res, {
    successful: result.created,
    failed: result.existing.map((student: any) => ({ 
      id: student.id_estudiante, 
      reason: 'Already exists' 
    })),
    total: students.length
  }, 'Bulk create completed');
}));

// Remove examen asignado by id_simulacro from multiple students
router.post('/remove-examen', asyncHandler(async (req: Request, res: Response) => {
  const { ids_estudiantes, simulationId } = req.body;
const id_simulacro= simulationId;
  if (!Array.isArray(ids_estudiantes) || ids_estudiantes.length === 0) {
    return ApiResponse.badRequest(res, 'Se requiere un array de ids_estudiantes');
  }

  if (!id_simulacro) {
    return ApiResponse.badRequest(res, 'Se requiere el id_simulacro');
  }

  const result = await studentService.removeExamenAsignado(ids_estudiantes, id_simulacro);

  return ApiResponse.bulk(res, {
    successful: result.updated,
    failed: result.notFound.map((id: string) => ({ id, reason: 'Student not found' })),
    total: ids_estudiantes.length
  }, 'Examen removed from students');
}));

// Get student by ID
router.get('/:collectionName/:id', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id } = req.params;
console.log(collectionName, id);

  const result = await studentService.getStudentById(collectionName, id);
  if (!result) {
    return ApiResponse.notFound(res, 'Estudiante no encontrado');
  }

  return ApiResponse.success(res, result, 'Student retrieved successfully');
}));



// Get student by student ID
router.get('/:collectionName/by-student-id/:id', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id } = req.params;

  const result = await studentService.getStudentByStudentId(collectionName, id);
  if (!result) {
    return ApiResponse.notFound(res, 'Estudiante no encontrado');
  }

  return ApiResponse.success(res, result, 'Student retrieved successfully');
}));

// Search students by field and value
router.get('/search/:field/:value', asyncHandler(async (req: Request, res: Response) => {
  const { field, value } = req.params;
  const documents = await studentService.searchByField("students", field, value);

  if (documents.length === 0) {
    return ApiResponse.notFound(res, `No se encontraron documentos para el campo "${field}" con el valor "${value}"`);
  }

  return ApiResponse.success(res, documents, 'Search results retrieved successfully');
}));

// Update student
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const result = await studentService.updateStudent('students', id, data);
  if (!result) {
    return ApiResponse.notFound(res, 'Estudiante no encontrado');
  }

  return ApiResponse.updated(res, result, 'Student updated successfully');
}));

// Delete student
router.delete('/:collectionName/:id', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id } = req.params;

  const result = await studentService.deleteStudent(collectionName, id);
  if (!result) {
    return ApiResponse.notFound(res, 'Estudiante no encontrado');
  }

  return ApiResponse.deleted(res, 'Student deleted successfully');
}));

// Get all students
router.get('/:collectionName', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const result = await studentService.getAllStudents(collectionName);
  
  // Simple pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResult = result.slice(startIndex, endIndex);

  return ApiResponse.paginated(res, paginatedResult, page, limit, result.length, 'Students retrieved successfully');
}));

// Create student
router.post('/:collectionName/:id?', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id } = req.params;
  const data = req.body.data || req.body;

  const idAux = id ?? data.id_student;
  const result = await studentService.createStudent(collectionName, data, idAux);

  return ApiResponse.created(res, result, 'Student created successfully');
}));

export default router;