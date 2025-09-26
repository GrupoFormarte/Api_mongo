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
exports.startTrackingPositions = startTrackingPositions;
const dynamicModel_1 = __importDefault(require("../../infrastructure/database/dynamicModel"));
const INTERVALO = 5 * 60 * 1000; // cada 5 minutos
const Estudiantes = (0, dynamicModel_1.default)('Estudiantes', {});
function startTrackingPositions() {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const estudiantes = yield Estudiantes.find().lean();
                const gradosMap = new Map();
                for (const estudiante of estudiantes) {
                    for (const gradoData of estudiante.grados) {
                        if (gradoData.scoreSimulacro && gradoData.scoreSimulacro > 0) {
                            if (!gradosMap.has(gradoData.grado)) {
                                gradosMap.set(gradoData.grado, []);
                            }
                            gradosMap.get(gradoData.grado).push({
                                id_student: estudiante.id_student,
                                score: gradoData.scoreSimulacro,
                                historyPosition: gradoData.historyPosition || [],
                            });
                        }
                    }
                }
                // Recalcular posiciones por grado
                for (const [grado, estudiantesPorGrado] of gradosMap.entries()) {
                    estudiantesPorGrado.sort((a, b) => b.score - a.score);
                    for (let i = 0; i < estudiantesPorGrado.length; i++) {
                        const estudiante = estudiantesPorGrado[i];
                        const posicionActual = i + 1;
                        const fecha = new Date().toISOString();
                        const historial = estudiante.historyPosition || [];
                        const ultima = historial[historial.length - 1];
                        // Solo actualiza si hay cambio de posición
                        if (!ultima || ultima.position !== posicionActual) {
                            yield Estudiantes.updateOne({ id_student: estudiante.id_student, 'grados.grado': grado }, {
                                $push: {
                                    'grados.$.historyPosition': {
                                        $each: [{ date: fecha, position: posicionActual }],
                                        $slice: -3 // ← solo mantener los últimos 3
                                    },
                                },
                            });
                            console.log(`Actualizada posición de ${estudiante.id_student} en grado ${grado} a ${posicionActual}`);
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error actualizando posiciones:', error);
            }
        }), INTERVALO);
    });
}
