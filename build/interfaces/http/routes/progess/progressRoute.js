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
const dynamicModel_1 = __importDefault(require("../../../../infrastructure/database/dynamicModel"));
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
router.get('/analisis/global/:idGrado/:idInstituto', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idGrado, idInstituto } = req.params;
    const { fechaInicio, fechaFin } = req.query;
    const ResultadosModel = (0, dynamicModel_1.default)('resultados_preguntas', {});
    const DetallePreguntasModel = (0, dynamicModel_1.default)('detail_preguntas', {});
    try {
        const filtroFecha = { idGrado, idInstituto };
        let resultados = yield ResultadosModel.find(filtroFecha);
        if (!fechaInicio || !fechaFin) {
            const currentYear = new Date().getFullYear();
            resultados = resultados.filter((r) => {
                const date = new Date(r.dateCreated);
                return date.getFullYear() === currentYear;
            });
        }
        else {
            const start = new Date(fechaInicio);
            const end = new Date(fechaFin);
            resultados = resultados.filter((r) => {
                const date = new Date(r.dateCreated);
                return date >= start && date <= end;
            });
        }
        const resumen = {};
        const resumenGlobal = {};
        const balanceMensual = {};
        for (const r of resultados) {
            const pregunta = yield DetallePreguntasModel.findById(r.idPregunta);
            if (!pregunta)
                continue;
            const area = pregunta.area || 'Sin área';
            const nombreAsignatura = pregunta.asignatura || 'Sin asignatura';
            const mes = (0, date_fns_1.format)(new Date(r.dateCreated), 'yyyy-MM');
            if (!resumen[area]) {
                resumen[area] = { progressAsignature: {} };
            }
            const entry = resumen[area];
            const asignaturaProgress = entry.progressAsignature[nombreAsignatura] || {
                nombre: nombreAsignatura,
                id: r.idAsignatura,
                errores: 0,
                aciertos: 0
            };
            if (!balanceMensual[mes]) {
                balanceMensual[mes] = {
                    totalPreguntas: 0,
                    aciertos: 0,
                    errores: 0,
                    porcentajeAcierto: 0
                };
            }
            if (r.respuesta === true) {
                asignaturaProgress.aciertos++;
                balanceMensual[mes].aciertos++;
            }
            else {
                asignaturaProgress.errores++;
                balanceMensual[mes].errores++;
            }
            balanceMensual[mes].totalPreguntas++;
            balanceMensual[mes].porcentajeAcierto = Math.round((balanceMensual[mes].aciertos / balanceMensual[mes].totalPreguntas) * 100);
            entry.progressAsignature[nombreAsignatura] = asignaturaProgress;
        }
        for (const r of resultados) {
            const pregunta = yield DetallePreguntasModel.findById(r.idPregunta);
            if (!pregunta)
                continue;
            const nombreAsignatura = r.asignatura || 'Sin asignatura';
            if (!resumenGlobal[nombreAsignatura]) {
                resumenGlobal[nombreAsignatura] = {
                    nombre: nombreAsignatura,
                    id: r.idAsignatura,
                    aciertos: 0,
                    errores: 0,
                    estudiantes: new Set()
                };
            }
            if (r.respuesta === true) {
                resumenGlobal[nombreAsignatura].aciertos++;
            }
            else {
                resumenGlobal[nombreAsignatura].errores++;
            }
            resumenGlobal[nombreAsignatura].estudiantes.add(r.idEstudiante);
        }
        const analisisPorArea = Object.entries(resumen).map(([area, data]) => ({
            area,
            asignaturas: Object.values(data.progressAsignature).map(a => ({
                asignatura: a.nombre,
                idAsignatura: a.id,
                aciertos: a.aciertos,
                errores: a.errores
            }))
        })).filter(area => area.asignaturas.length > 0);
        const resumenGlobalArray = Object.values(resumenGlobal).map((asig) => {
            const total = asig.aciertos + asig.errores;
            return {
                asignatura: asig.nombre,
                idAsignatura: asig.id,
                totalPreguntas: total,
                aciertos: asig.aciertos,
                errores: asig.errores,
                porcentajeAcierto: total > 0 ? Math.round((asig.aciertos / total) * 100) : 0,
                estudiantes: asig.estudiantes.size
            };
        });
        res.status(200).json({
            analisisPorArea,
            resumenGlobal: resumenGlobalArray,
            balanceGeneral: balanceMensual
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el análisis de asignaturas', error });
    }
}));
router.get('/analisis/asignaturas/:idEstudiante/:idGrado/:idInstituto', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEstudiante, idGrado, idInstituto } = req.params;
    const { fechaInicio, fechaFin } = req.query;
    const ResultadosModel = (0, dynamicModel_1.default)('resultados_preguntas', {});
    const DetallePreguntasModel = (0, dynamicModel_1.default)('detail_preguntas', {});
    try {
        const filtroFecha = { idEstudiante, idGrado, idInstituto };
        let resultados = yield ResultadosModel.find(filtroFecha);
        if (!fechaInicio || !fechaFin) {
            const currentYear = new Date().getFullYear();
            resultados = resultados.filter((r) => {
                const date = new Date(r.dateCreated);
                return date.getFullYear() === currentYear;
            });
        }
        else {
            const start = new Date(fechaInicio);
            const end = new Date(fechaFin);
            resultados = resultados.filter((r) => {
                const date = new Date(r.dateCreated);
                return date >= start && date <= end;
            });
        }
        const resumen = {};
        const resumenGlobal = {};
        const balanceMensual = {};
        for (const r of resultados) {
            const pregunta = yield DetallePreguntasModel.findById(r.idPregunta);
            if (!pregunta)
                continue;
            const area = pregunta.area || 'Sin área';
            const nombreAsignatura = pregunta.asignatura || 'Sin asignatura';
            const mes = (0, date_fns_1.format)(new Date(r.dateCreated), 'yyyy-MM');
            if (!resumen[area]) {
                resumen[area] = { progressAsignature: {} };
            }
            const entry = resumen[area];
            const asignaturaProgress = entry.progressAsignature[nombreAsignatura] || {
                nombre: nombreAsignatura,
                id: r.idAsignatura,
                errores: 0,
                aciertos: 0
            };
            if (!resumenGlobal[nombreAsignatura]) {
                resumenGlobal[nombreAsignatura] = {
                    nombre: nombreAsignatura,
                    id: r.idAsignatura,
                    aciertos: 0,
                    errores: 0
                };
            }
            if (!balanceMensual[mes]) {
                balanceMensual[mes] = {
                    totalPreguntas: 0,
                    aciertos: 0,
                    errores: 0,
                    porcentajeAcierto: 0
                };
            }
            if (r.respuesta === true) {
                asignaturaProgress.aciertos++;
                resumenGlobal[nombreAsignatura].aciertos++;
                balanceMensual[mes].aciertos++;
            }
            else {
                asignaturaProgress.errores++;
                resumenGlobal[nombreAsignatura].errores++;
                balanceMensual[mes].errores++;
            }
            balanceMensual[mes].totalPreguntas++;
            balanceMensual[mes].porcentajeAcierto = Math.round((balanceMensual[mes].aciertos / balanceMensual[mes].totalPreguntas) * 100);
            entry.progressAsignature[nombreAsignatura] = asignaturaProgress;
        }
        const analisisPorArea = Object.entries(resumen).map(([area, data]) => ({
            area,
            asignaturas: Object.values(data.progressAsignature).map(a => ({
                asignatura: a.nombre,
                idAsignatura: a.id,
                aciertos: a.aciertos,
                errores: a.errores
            }))
        })).filter(area => area.asignaturas.length > 0);
        const resumenGlobalArray = Object.values(resumenGlobal).map((asig) => {
            const total = asig.aciertos + asig.errores;
            return {
                asignatura: asig.nombre,
                idAsignatura: asig.id,
                totalPreguntas: total,
                aciertos: asig.aciertos,
                errores: asig.errores,
                porcentajeAcierto: total > 0 ? Math.round((asig.aciertos / total) * 100) : 0
            };
        });
        res.status(200).json({
            analisisPorArea,
            resumenGlobal: resumenGlobalArray,
            balanceGeneral: balanceMensual
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el análisis de asignaturas', error });
    }
}));
router.get('/analisis/posiciones/:idGrado/:idInstituto', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idGrado, idInstituto } = req.params;
    const { fechaInicio, fechaFin } = req.query;
    const ResultadosModel = (0, dynamicModel_1.default)('resultados_preguntas', {});
    const DetallePreguntasModel = (0, dynamicModel_1.default)('detail_preguntas', {});
    const EstudiantesModel = (0, dynamicModel_1.default)('Estudiantes', {});
    try {
        const filtroFecha = { idGrado, idInstituto };
        let resultados = yield ResultadosModel.find(filtroFecha);
        if (!fechaInicio || !fechaFin) {
            const currentYear = new Date().getFullYear();
            resultados = resultados.filter((r) => {
                const date = new Date(r.dateCreated);
                return date.getFullYear() === currentYear;
            });
        }
        else {
            const start = new Date(fechaInicio);
            const end = new Date(fechaFin);
            resultados = resultados.filter((r) => {
                const date = new Date(r.dateCreated);
                return date >= start && date <= end;
            });
        }
        const resumenEstudiantes = {};
        for (const r of resultados) {
            const pregunta = yield DetallePreguntasModel.findById(r.idPregunta);
            const estudianteData = yield EstudiantesModel.findOne({ id_student: r.idEstudiante });
            const primerNombreEstudiante = (estudianteData === null || estudianteData === void 0 ? void 0 : estudianteData.name) || '';
            const apellidoEstudiante = (estudianteData === null || estudianteData === void 0 ? void 0 : estudianteData.last_name) || '';
            const segundoApellido = (estudianteData === null || estudianteData === void 0 ? void 0 : estudianteData.second_last_name) || '';
            const segundoNombre = (estudianteData === null || estudianteData === void 0 ? void 0 : estudianteData.second_name) || '';
            const nombreEstudiante = `${primerNombreEstudiante} ${segundoNombre} ${apellidoEstudiante} ${segundoApellido}`;
            const numberId = (estudianteData === null || estudianteData === void 0 ? void 0 : estudianteData.identification_number) || '';
            if (!pregunta)
                continue;
            const idEstudiante = r.idEstudiante;
            const asignatura = pregunta.asignatura || 'Sin asignatura';
            const area = pregunta.area || 'Sin área';
            if (!resumenEstudiantes[idEstudiante]) {
                resumenEstudiantes[idEstudiante] = {
                    idEstudiante,
                    nombreEstudiante,
                    numberId,
                    asignaturas: {},
                    areas: {}
                };
            }
            const estudiante = resumenEstudiantes[idEstudiante];
            if (!estudiante.asignaturas[asignatura]) {
                estudiante.asignaturas[asignatura] = {
                    nombre: asignatura,
                    aciertos: 0,
                    errores: 0
                };
            }
            if (!estudiante.areas[area]) {
                estudiante.areas[area] = {
                    nombre: area,
                    aciertos: 0,
                    errores: 0
                };
            }
            if (r.respuesta === true) {
                estudiante.asignaturas[asignatura].aciertos++;
                estudiante.areas[area].aciertos++;
            }
            else {
                estudiante.asignaturas[asignatura].errores++;
                estudiante.areas[area].errores++;
            }
        }
        const posicionesAsignaturas = {};
        const posicionesAreas = {};
        for (const estudiante of Object.values(resumenEstudiantes)) {
            for (const [nombreAsig, dataAsig] of Object.entries(estudiante.asignaturas)) {
                if (!posicionesAsignaturas[nombreAsig])
                    posicionesAsignaturas[nombreAsig] = [];
                posicionesAsignaturas[nombreAsig].push({
                    idEstudiante: estudiante.idEstudiante,
                    nombreEstudiante: estudiante.nombreEstudiante,
                    numberId: estudiante.numberId,
                    nombre: dataAsig.nombre,
                    aciertos: dataAsig.aciertos,
                    errores: dataAsig.errores,
                    total: dataAsig.aciertos + dataAsig.errores,
                    porcentajeAcierto: dataAsig.aciertos + dataAsig.errores > 0 ? Math.round((dataAsig.aciertos / (dataAsig.aciertos + dataAsig.errores)) * 100) : 0
                });
            }
            for (const [nombreArea, dataArea] of Object.entries(estudiante.areas)) {
                if (!posicionesAreas[nombreArea])
                    posicionesAreas[nombreArea] = [];
                posicionesAreas[nombreArea].push({
                    idEstudiante: estudiante.idEstudiante,
                    nombreEstudiante: estudiante.nombreEstudiante,
                    numberId: estudiante.numberId,
                    nombre: dataArea.nombre,
                    aciertos: dataArea.aciertos,
                    errores: dataArea.errores,
                    total: dataArea.aciertos + dataArea.errores,
                    porcentajeAcierto: dataArea.aciertos + dataArea.errores > 0 ? Math.round((dataArea.aciertos / (dataArea.aciertos + dataArea.errores)) * 100) : 0
                });
            }
        }
        const asignaturas = Object.entries(posicionesAsignaturas).map(([nombre, estudiantes]) => ({
            asignatura: nombre,
            estudiantes_por_posicion: estudiantes.sort((a, b) => b.porcentajeAcierto - a.porcentajeAcierto)
        }));
        const areas = Object.entries(posicionesAreas).map(([nombre, estudiantes]) => ({
            area: nombre,
            estudiantes_por_posicion: estudiantes.sort((a, b) => b.porcentajeAcierto - a.porcentajeAcierto)
        }));
        const mejoresAsignaturas = asignaturas.map(a => ({
            asignatura: a.asignatura,
            estudiantes_por_posicion: [a.estudiantes_por_posicion[0]]
        }));
        const mejoresAreas = areas.map(a => ({
            area: a.area,
            estudiantes_por_posicion: [a.estudiantes_por_posicion[0]]
        }));
        res.status(200).json({
            asignaturas,
            areas,
            mejoresPorAsignatura: mejoresAsignaturas,
            mejoresPorArea: mejoresAreas
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener posiciones por asignatura y área', error });
    }
}));
exports.default = router;
