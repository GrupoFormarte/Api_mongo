"use strict";
// ================================================
// CRUD ROUTES - REFACTORED VERSION
// ================================================
// 
// Este archivo ha sido refactorizado para usar la nueva arquitectura.
// La implementación original de 594 líneas ha sido separada en:
// - AcademicService: Lógica académica (áreas, asignaturas, simulacros)
// - StudentService: Operaciones de estudiantes y ranking
// - DynamicRepository: Acceso a datos abstraccionado
// 
// Para compatibilidad, las rutas legacy siguen funcionando pero ahora
// usan los nuevos servicios internamente.
// 
// Migración recomendada:
// - Usar /api/v2/academic/* para operaciones académicas
// - Usar /api/v2/students/* para operaciones de estudiantes
// - Usar /api/v2/crud/* para CRUD genérico
// 
// ================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var crud_legacy_1 = require("./crud_legacy");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(crud_legacy_1).default; } });
