import { Router, Request, Response } from 'express';
import createDynamicModel from '../../../../infrastructure/database/dynamicModel';
import { format } from 'date-fns';


const router = Router();

router.get('/analisis/global/:idGrado/:idInstituto', async (req: Request, res: Response) => {
    const { idGrado, idInstituto } = req.params;
    const { fechaInicio, fechaFin } = req.query;
    
  


    const ResultadosModel = createDynamicModel('resultados_preguntas', {});
    const DetallePreguntasModel: any = createDynamicModel('detail_preguntas', {});

    try {
        const filtroFecha: any = { idGrado, idInstituto };

    

   let resultados: any = await ResultadosModel.find(filtroFecha);
        if (!fechaInicio || !fechaFin) {
            const currentYear = new Date().getFullYear();
            resultados = resultados.filter((r:any)=> {
              const date = new Date(r.dateCreated);
              return date.getFullYear() === currentYear;
            });
          } else {
            const start = new Date(fechaInicio as string);
            const end = new Date(fechaFin as string);
            resultados = resultados.filter((r:any) => {
              const date = new Date(r.dateCreated);
              return date >= start && date <= end;
            });
          }

        const resumen: Record<string, {
            progressAsignature: Record<string, {
                nombre: string;
                id: string;
                errores: number;
                aciertos: number;
            }>;
        }> = {};

        const resumenGlobal: Record<string, {
            nombre: string;
            id: string;
            aciertos: number;
            errores: number;
            estudiantes: Set<string>;
        }> = {};

        const balanceMensual: Record<string, {
            totalPreguntas: number;
            aciertos: number;
            errores: number;
            porcentajeAcierto: number;
        }> = {};

        for (const r of resultados) {
            const pregunta = await DetallePreguntasModel.findById(r.idPregunta);
            if (!pregunta) continue;

            const area = pregunta.area || 'Sin área';
            const nombreAsignatura = pregunta.asignatura || 'Sin asignatura';
            const mes = format(new Date(r.dateCreated), 'yyyy-MM');

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
            } else {
                asignaturaProgress.errores++;

                balanceMensual[mes].errores++;
            }

            balanceMensual[mes].totalPreguntas++;
            balanceMensual[mes].porcentajeAcierto = Math.round(
                (balanceMensual[mes].aciertos / balanceMensual[mes].totalPreguntas) * 100
            );

            entry.progressAsignature[nombreAsignatura] = asignaturaProgress;
        }

        for (const r of resultados) {
            const pregunta = await DetallePreguntasModel.findById(r.idPregunta);
            if (!pregunta) continue;
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
            } else {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el análisis de asignaturas', error });
    }
});

router.get('/analisis/asignaturas/:idEstudiante/:idGrado/:idInstituto', async (req: Request, res: Response) => {
    const { idEstudiante, idGrado, idInstituto } = req.params;
    const { fechaInicio, fechaFin } = req.query;
  

    const ResultadosModel = createDynamicModel('resultados_preguntas', {});
    const DetallePreguntasModel: any = createDynamicModel('detail_preguntas', {});

    try {
        const filtroFecha: any = { idEstudiante, idGrado, idInstituto };
 


        let resultados: any = await ResultadosModel.find(filtroFecha);
        if (!fechaInicio || !fechaFin) {
            const currentYear = new Date().getFullYear();
            resultados = resultados.filter((r:any)=> {
              const date = new Date(r.dateCreated);
              return date.getFullYear() === currentYear;
            });
          } else {
            const start = new Date(fechaInicio as string);
            const end = new Date(fechaFin as string);
            resultados = resultados.filter((r:any) => {
              const date = new Date(r.dateCreated);
              return date >= start && date <= end;
            });
          }
        const resumen: Record<string, {
            progressAsignature: Record<string, {
                nombre: string;
                id: string;
                errores: number;
                aciertos: number;
            }>;
        }> = {};

        const resumenGlobal: Record<string, {
            nombre: string;
            id: string;
            aciertos: number;
            errores: number;
        }> = {};

        const balanceMensual: Record<string, {
            totalPreguntas: number;
            aciertos: number;
            errores: number;
            porcentajeAcierto: number;
        }> = {};

        for (const r of resultados) {
            const pregunta = await DetallePreguntasModel.findById(r.idPregunta);
            if (!pregunta) continue;

            const area = pregunta.area || 'Sin área';
            const nombreAsignatura = pregunta.asignatura || 'Sin asignatura';
            const mes = format(new Date(r.dateCreated), 'yyyy-MM');

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
            } else {
                asignaturaProgress.errores++;
                resumenGlobal[nombreAsignatura].errores++;
                balanceMensual[mes].errores++;
            }

            balanceMensual[mes].totalPreguntas++;
            balanceMensual[mes].porcentajeAcierto = Math.round(
                (balanceMensual[mes].aciertos / balanceMensual[mes].totalPreguntas) * 100
            );

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el análisis de asignaturas', error });
    }
});
router.get('/analisis/posiciones/:idGrado/:idInstituto', async (req: Request, res: Response) => {
    const { idGrado, idInstituto } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    const ResultadosModel = createDynamicModel('resultados_preguntas', {});
    const DetallePreguntasModel: any = createDynamicModel('detail_preguntas', {});
    const EstudiantesModel: any = createDynamicModel('Estudiantes', {});

    try {
        const filtroFecha: any = { idGrado, idInstituto };

        let resultados: any = await ResultadosModel.find(filtroFecha);
        if (!fechaInicio || !fechaFin) {
            const currentYear = new Date().getFullYear();
            resultados = resultados.filter((r: any) => {
                const date = new Date(r.dateCreated);
                return date.getFullYear() === currentYear;
            });
        } else {
            const start = new Date(fechaInicio as string);
            const end = new Date(fechaFin as string);
            resultados = resultados.filter((r: any) => {
                const date = new Date(r.dateCreated);
                return date >= start && date <= end;
            });
        }

        const resumenEstudiantes: Record<string, {
            idEstudiante: string;
            nombreEstudiante: string;
            numberId: string;
            asignaturas: Record<string, {
                nombre: string;
                aciertos: number;
                errores: number;
            }>;
            areas: Record<string, {
                nombre: string;
                aciertos: number;
                errores: number;
            }>;
        }> = {};

        for (const r of resultados) {
            const pregunta = await DetallePreguntasModel.findById(r.idPregunta);
            const estudianteData = await EstudiantesModel.findOne({ id_student: r.idEstudiante });

            const primerNombreEstudiante = estudianteData?.name || '';
            const apellidoEstudiante = estudianteData?.last_name || '';
            const segundoApellido = estudianteData?.second_last_name || '';
            const segundoNombre = estudianteData?.second_name || '';
            const nombreEstudiante = `${primerNombreEstudiante} ${segundoNombre} ${apellidoEstudiante} ${segundoApellido}`;
            const numberId = estudianteData?.identification_number || '';

            if (!pregunta) continue;

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
            } else {
                estudiante.asignaturas[asignatura].errores++;
                estudiante.areas[area].errores++;
            }
        }

        const posicionesAsignaturas: Record<string, any[]> = {};
        const posicionesAreas: Record<string, any[]> = {};

        for (const estudiante of Object.values(resumenEstudiantes)) {
            for (const [nombreAsig, dataAsig] of Object.entries(estudiante.asignaturas)) {
                if (!posicionesAsignaturas[nombreAsig]) posicionesAsignaturas[nombreAsig] = [];
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
                if (!posicionesAreas[nombreArea]) posicionesAreas[nombreArea] = [];
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener posiciones por asignatura y área', error });
    }
});


export default router;





   