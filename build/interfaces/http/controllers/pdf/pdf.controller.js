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
exports.generateReport = void 0;
const ejs_1 = __importDefault(require("ejs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const sse_service_1 = require("../../../websocket/sse.service");
const generateReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const students = req.body.listado;
    // const userId = req.body.userId;
    if (!students || !Array.isArray(students)) {
        return;
    }
    console.log(students[0]);
    const browser = yield puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const pdfDocs = [];
    const logoPath = path_1.default.join(process.cwd(), 'storage/templates/logo_podium.png');
    const logoBase64 = fs_1.default.readFileSync(logoPath, { encoding: 'base64' });
    const logoDataUrl = `data:image/png;base64,${logoBase64}`;
    for (const student of students) {
        const html = yield ejs_1.default.renderFile(
        // path.join(__dirname, "../../templates/report.ejs"),
        path_1.default.join(process.cwd(), "storage/templates/report.ejs"), { student, logoUrl: logoDataUrl }, { async: true });
        const page = yield browser.newPage();
        yield page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer = yield page.pdf({ format: "A4", printBackground: true });
        pdfDocs.push(pdfBuffer);
    }
    yield browser.close();
    // Crear un nuevo documento PDF combinado
    const mergedPdf = yield pdf_lib_1.PDFDocument.create();
    for (const pdfBytes of pdfDocs) {
        const pdf = yield pdf_lib_1.PDFDocument.load(pdfBytes);
        const copiedPages = yield mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const finalPdf = yield mergedPdf.save();
    const tempId = crypto_1.default.randomUUID();
    const filePath = path_1.default.join(process.cwd(), `storage/uploads/${tempId}.pdf`);
    fs_1.default.writeFileSync(filePath, finalPdf);
    //   res.set({
    //     "Content-Type": "application/pdf",
    //     "Content-Disposition": "attachment; filename=reportes.pdf",
    //   });
    //   res.send(Buffer.from(finalPdf));
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${tempId}.pdf`;
    // Enviar el evento SSE
    (0, sse_service_1.pushToWSClients)({
        status: 'pdf-ready',
        // userId,
        url: fileUrl,
        message: 'Tu archivo está listo para descargar',
    });
    // Respuesta vacía si no se descarga directamente
    res.status(202).send({ message: 'Generación en proceso' });
    // Opción: borrar el archivo después de 5 minutos
    setTimeout(() => {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            console.log(`Archivo temporal eliminado: ${filePath}`);
        }
    }, 5 * 60 * 1000);
});
exports.generateReport = generateReport;
