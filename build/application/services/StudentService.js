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
exports.StudentService = void 0;
const DynamicRepository_1 = require("../../infrastructure/repositories/DynamicRepository");
class StudentService {
    constructor() {
        this.repository = new DynamicRepository_1.DynamicRepository();
    }
    getStudentPosition(grado, id_student) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const student = yield this.repository.findOne('Estudiantes', { id_student });
            if (!student) {
                return { posicion: 0, n_estudiantes: 0 };
            }
            const gradoDoc = (_a = student.grados) === null || _a === void 0 ? void 0 : _a.find((g) => g.grado === grado);
            if (!gradoDoc || gradoDoc.scoreSimulacro == 0) {
                return { posicion: 0, n_estudiantes: 0 };
            }
            const estudiantes = yield this.repository.find('Estudiantes', {});
            const scoresSimulacro = [];
            for (const otherStudent of estudiantes) {
                if (otherStudent.id_student === id_student)
                    continue;
                for (const g of otherStudent.grados || []) {
                    if (g.grado === grado) {
                        scoresSimulacro.push(g.scoreSimulacro || 0);
                    }
                }
            }
            scoresSimulacro.push(gradoDoc.scoreSimulacro);
            scoresSimulacro.sort((a, b) => b - a);
            const posicion = scoresSimulacro.indexOf(gradoDoc.scoreSimulacro) + 1;
            const n_estudiantes = estudiantes.length;
            return { posicion, n_estudiantes };
        });
    }
    updateStudentsBulk(collectionName, students) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(students) || students.length === 0) {
                throw new Error('Se requiere un array de estudiantes para actualizar.');
            }
            return yield this.repository.bulkUpdate(collectionName, students);
        });
    }
    createStudentsUnique(collectionName, students) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(students) || students.length === 0) {
                throw new Error('Se requiere un array de estudiantes.');
            }
            return yield this.repository.bulkCreateUnique(collectionName, students);
        });
    }
    getStudentById(collectionName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.findById(collectionName, id);
        });
    }
    getStudentByStudentId(collectionName, id_student) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.findOne(collectionName, { id_student });
        });
    }
    updateStudent(collectionName, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.updateById(collectionName, id, data);
        });
    }
    deleteStudent(collectionName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.deleteById(collectionName, id);
        });
    }
    getAllStudents(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.find(collectionName);
        });
    }
    createStudent(collectionName, data, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentData = id ? Object.assign(Object.assign({}, data), { id }) : data;
            return yield this.repository.create(collectionName, documentData);
        });
    }
}
exports.StudentService = StudentService;
