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
const pdf_controller_1 = require("../controllers/pdf/pdf.controller");
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
router.post("/generate", pdf_controller_1.generateReport);
router.get("/preview", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const student = {
        evaluacion: 'ASIT',
        nombre: 'Aguilar',
        codigo: '1112049372',
        numeroLista: 1,
        institucion: 'FORMARTE MEDELLIN',
        grupo: 'UDEA G-1',
        puesto: 5,
        gra: 0,
        gru: 0,
        ciudad: 'Medellín',
        fecha: '2025-06-13T09:16:10.030',
        puntaje: 24.885,
        areas: [
            {
                nombre: 'Competencia Lectora',
                correctas: 10,
                total: 40,
                puntaje: 25
            },
            {
                nombre: 'Razonamiento Lógico',
                correctas: 13,
                total: 40,
                puntaje: 33
            }
        ]
    };
    const logoPath = path_1.default.join(process.cwd(), 'storage/templates/logo_podium.png');
    const logoBase64 = fs_1.default.readFileSync(logoPath, { encoding: 'base64' });
    const logoDataUrl = `data:image/png;base64,${logoBase64}`;
    // const html = await ejs.renderFile(path.join(__dirname, "../templates/report.ejs"), { student });  path.join(process.cwd(), "src/templates/report.ejs"),
    const html = yield ejs_1.default.renderFile(path_1.default.join(process.cwd(), "storage/templates/report.ejs"), { student, logoUrl: logoDataUrl });
    res.send(html);
}));
exports.default = router;
