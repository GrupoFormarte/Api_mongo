import { Router, Request, Response } from 'express';
import { AcademicService } from '../../../application/services/AcademicService';
import { StudentService } from '../../../application/services/StudentService';
import { DynamicRepository } from '../../../infrastructure/repositories/DynamicRepository';
import { asyncHandler, AppError } from '../../../shared/middleware/errorHandler';

const router = Router();
const academicService = new AcademicService();
const studentService = new StudentService();
const repository = new DynamicRepository();

// ================================================
// LEGACY CRUD OPERATIONS - USING NEW SERVICES
// ================================================

// Obtener áreas por IDs en bulk
router.post('/get-areas/bulk', asyncHandler(async (req: Request, res: Response) => {
  const { grado, ids } = req.body;
  const result = await academicService.getAreasByIds(grado, ids);
  res.status(200).json(result);
}));

// Obtener asignaturas por IDs en bulk
router.post('/get-asignatures/bulk', asyncHandler(async (req: Request, res: Response) => {
  const { grado, ids } = req.body;
  const result = await academicService.getSubjectsByIds(grado, ids);
  res.status(200).json(result);
}));

// Obtener documentos por IDs en bulk (genérico)
router.post('/:collectionName/bulk', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName } = req.params;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Se requiere un array "ids" con al menos un elemento', 400);
  }

  const documents = await repository.findByIds(collectionName, ids);
  if (!documents || documents.length === 0) {
    throw new AppError('No se encontraron documentos para los IDs especificados', 404);
  }

  res.status(200).json(documents);
}));

// Actualizar múltiples documentos
router.put('/:collectionName/bulk-update', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName } = req.params;
  const { students } = req.body;

  const result = await studentService.updateStudentsBulk(collectionName, students);
  
  res.status(200).json({
    message: `${result.updated.length} estudiantes actualizados.`,
    actualizados: result.updated,
    no_encontrados: result.notFound
  });
}));

// Crear múltiples documentos (solo si no existen)
router.post('/:collectionName/bulk-create-unique', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName } = req.params;
  const { students } = req.body;

  const result = await studentService.createStudentsUnique(collectionName, students);

  res.status(200).json({
    message: `${result.created.length} estudiantes creados. ${result.existing.length} ya existían.`,
    creados: result.created,
    existentes: result.existing
  });
}));

// Buscar documentos por campo dinámico
router.get('/:collectionName/search/:field/:value', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, field, value } = req.params;
  
  const documents = await repository.searchByField(collectionName, field, value);
  if (documents.length === 0) {
    throw new AppError(`No se encontraron documentos para el campo "${field}" con el valor "${value}"`, 404);
  }
  
  res.status(200).json(documents);
}));

// Buscar documentos por múltiples campos
router.get('/:collectionName/multi-search/:query', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, query } = req.params;
  const fields = req.query.fields ? (req.query.fields as string).split(',') : [];
  
  const documents = await repository.multiFieldSearch(collectionName, query, fields);
  res.status(200).json(documents);
}));

// Buscar por categoría
router.get('/:collectionName/category/:category', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, category } = req.params;
  
  const documents = await repository.findByCategory(collectionName, category);
  res.status(200).json(documents);
}));

// Crear documento (con o sin ID específico)
router.post('/:collectionName/:id?', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id } = req.params;
  const data = req.body.data || req.body;

  const result = await studentService.createStudent(collectionName, data, id);
  res.status(201).json(result);
}));

// Generar simulacro
router.get('/generate-simulacro/:value/:cantidad', asyncHandler(async (req: Request, res: Response) => {
  const { value, cantidad } = req.params;
  const result = await academicService.generateSimulacro(value, cantidad);
  res.status(200).json(result);
}));

// Obtener asignatura por ID
router.get('/get-asignatures/:idAsignature/:valueGrado', asyncHandler(async (req: Request, res: Response) => {
  const { idAsignature, valueGrado } = req.params;
  const result = await academicService.getSubjectById(idAsignature, valueGrado);
  
  if (!result) {
    throw new AppError('Asignatura no encontrada', 404);
  }
  
  res.status(200).json(result);
}));

// Obtener todos los documentos de una colección
router.get('/:collectionName', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName } = req.params;
  const documents = await repository.find(collectionName);
  res.status(200).json(documents);
}));

// Obtener pregunta específica
router.get('/get-questions/:idquestion/:idProgram?', asyncHandler(async (req: Request, res: Response) => {
  const { idquestion } = req.params;
  const result = await academicService.getQuestionById(idquestion);
  
  if (!result) {
    throw new AppError('Pregunta no encontrada', 404);
  }
  
  res.status(200).json(result);
}));

// Obtener documento por ID
router.get('/:collectionName/:id', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id } = req.params;
  const document = await repository.findById(collectionName, id);
  
  if (!document) {
    throw new AppError('Documento no encontrado', 404);
  }
  
  res.status(200).json(document);
}));

// Obtener documento por ID de estudiante
router.get('/:collectionName/convert_id/:id', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id } = req.params;
  const document = await studentService.getStudentByStudentId(collectionName, id);
  
  if (!document) {
    throw new AppError('Estudiante no encontrado', 404);
  }
  
  res.status(200).json(document);
}));

// Obtener posición del estudiante en ranking
router.get('/get-my-position/:grado/:id_student', asyncHandler(async (req: Request, res: Response) => {
  const { id_student, grado } = req.params;
  const result = await studentService.getStudentPosition(grado, id_student);
  res.status(200).json(result);
}));

// Actualizar documento por ID
router.put('/:collectionName/:id', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id } = req.params;
  const data = req.body;
  
  const document = await repository.updateById(collectionName, id, data);
  if (!document) {
    throw new AppError('Documento no encontrado', 404);
  }
  
  res.status(200).json(document);
}));

// Eliminar documento por ID
router.delete('/:collectionName/:id', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id } = req.params;
  
  const document = await repository.deleteById(collectionName, id);
  if (!document) {
    throw new AppError('Documento no encontrado', 404);
  }
  
  res.status(200).json(document);
}));

// Obtener preguntas por tipo y área
router.get('/preguntas-por-tipo/:idPrograma/:type/:value', asyncHandler(async (req: Request, res: Response) => {
  const { idPrograma, value } = req.params;
  const result = await academicService.getQuestionsByTypeAndArea(idPrograma, value);
  res.status(200).json(result);
}));

// Obtener nivel académico por puntaje
router.get('/:collectionName/:id/:score', asyncHandler(async (req: Request, res: Response) => {
  const { collectionName, id, score } = req.params;
  const result = await academicService.getAcademicLevelByScore(collectionName, id, score);
  res.status(200).json(result);
}));

export default router;