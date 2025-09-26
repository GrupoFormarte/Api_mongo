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
exports.AcademicService = void 0;
const DynamicRepository_1 = require("../../infrastructure/repositories/DynamicRepository");
class AcademicService {
    constructor() {
        this.repository = new DynamicRepository_1.DynamicRepository();
    }
    getAreasByIds(grado, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            for (const idAsignature of ids) {
                const document = yield this.repository.findById("Area", idAsignature);
                if (!document)
                    continue;
                const questions = yield this.repository.find('detail_preguntas', {
                    grado,
                    tipo_platform: 'App',
                    area: document.value
                });
                const preguntas = questions.map(q => q.id);
                const doc = Object.assign(Object.assign({}, document._doc), { childrents: preguntas });
                result.push(doc);
            }
            return result;
        });
    }
    getSubjectsByIds(grado, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            for (const idAsignature of ids) {
                const document = yield this.repository.findById("Asignaturas", idAsignature);
                if (!document)
                    continue;
                const questions = yield this.repository.find('detail_preguntas', {
                    grado,
                    tipo_platform: 'App',
                    asignatura: document.value
                });
                const preguntas = questions.map(q => q.id);
                const doc = Object.assign(Object.assign({}, document._doc), { childrents: preguntas });
                result.push(doc);
            }
            return result;
        });
    }
    getSubjectById(idAsignature, valueGrado) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield this.repository.findById("Asignaturas", idAsignature);
            if (!document)
                return null;
            const questions = yield this.repository.find('detail_preguntas', {
                grado: valueGrado,
                tipo_platform: 'App',
                asignatura: document.value
            });
            const preguntas = questions.map(q => q.id);
            return Object.assign(Object.assign({}, document._doc), { childrents: preguntas });
        });
    }
    generateSimulacro(value, cantidad) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield this.repository.findOne('Grados', { value });
            if (!document) {
                throw new Error("Grado no encontrado");
            }
            const pregunt = yield this.repository.find('detail_preguntas', {
                programa: value,
                tipo_platform: 'App'
            });
            // Group questions by area
            const groupedByArea = pregunt.reduce((acc, curr) => {
                const area = curr.area || 'Sin área';
                if (!acc[area]) {
                    acc[area] = [];
                }
                acc[area].push(curr.id);
                return acc;
            }, {});
            const allIds = Object.values(groupedByArea).flat();
            // Validate quantity
            const cantidadInt = parseInt(cantidad);
            const cantidadInt2 = cantidadInt > 2 ? cantidadInt : 40;
            // Choose random questions while preserving original order
            const shuffled = [...allIds].sort(() => Math.random() - 0.5);
            const selectedSet = new Set(shuffled.slice(0, cantidadInt2));
            // Filter from allIds, but respect original order
            const preguntas = allIds.filter(id => selectedSet.has(id));
            return { data: preguntas };
        });
    }
    getQuestionById(idquestion) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.findById("detail_preguntas", idquestion);
        });
    }
    getQuestionsByTypeAndArea(idPrograma, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const grados = yield this.repository.find('Grados', { value: idPrograma });
            if (!grados || grados.length === 0) {
                throw new Error("Programa no encontrado");
            }
            const preguntas = yield this.repository.find('detail_preguntas', {
                area: value,
                tipo_platform: { $in: [null, "Examen"] },
                programa: idPrograma,
                grado: idPrograma,
            }, {
                "pregunta": 1,
                "cod": 1,
                "id": 1,
                "area": 1
            });
            return preguntas;
        });
    }
    getAcademicLevelByScore(collectionName, id, score) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield this.repository.findById(collectionName, id);
            if (!document) {
                throw new Error('Academic level not found');
            }
            const scoreValue = parseInt(score, 10);
            let previousLevelColor = null;
            for (let index = 0; index < document.types_levels.length; index++) {
                const type = document.types_levels[index];
                const min = parseInt(type.min, 10);
                const max = parseInt(type.max, 10);
                if (document.types_levels.length > 1 && index > 0) {
                    previousLevelColor = document.types_levels[index - 1].color;
                }
                if (scoreValue >= min && scoreValue <= max) {
                    for (const level of type.levels) {
                        const puntaje = parseInt(level.puntaje, 10);
                        if (scoreValue <= puntaje) {
                            return {
                                level: level.level,
                                currentColor: type.color,
                                typeName: type.name,
                                previousColor: previousLevelColor
                            };
                        }
                    }
                }
            }
            throw new Error('Score does not match any level');
        });
    }
}
exports.AcademicService = AcademicService;
