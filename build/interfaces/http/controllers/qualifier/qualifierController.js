"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileExcel = exports.uploadFile = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const fileReader_1 = require("../../../../shared/utils/fileReader");
const responseHandler_1 = require("../../../../shared/utils/responseHandler");
const uploadFile = (req, res) => {
    try {
        const { file } = req.body;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded or file data missing' });
        }
        const buffer = Buffer.from(file, 'base64');
        const data = buffer.toString('utf-8');
        const processedData = (0, fileReader_1.processFileWithRoute)(data);
        responseHandler_1.ResponseHandler.success(res, processedData, 'File processed successfully');
    }
    catch (error) {
        responseHandler_1.ResponseHandler.error(res, error);
    }
};
exports.uploadFile = uploadFile;
const uploadFileExcel = (req, res) => {
    try {
        const { file } = req.body;
        // Verificar si el archivo fue enviado
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded or file data missing' });
        }
        // Decodificar el archivo base64 directamente a un buffer
        const buffer = Buffer.from(file, 'base64');
        // Leer el archivo Excel directamente desde el buffer
        const workbook = xlsx_1.default.read(buffer, { type: 'buffer' });
        // Procesar todas las hojas y convertirlas en un único listado
        const sheets = workbook.SheetNames;
        const flattenedList = [];
        sheets.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const sheetData = xlsx_1.default.utils.sheet_to_json(sheet);
            // Transformar las claves de cada objeto
            const transformedData = sheetData.map((row) => {
                const transformedRow = {};
                Object.keys(row).forEach((key) => {
                    const transformedKey = key
                        .toLowerCase() // Convertir a minúsculas
                        .replace(/\s+/g, '_'); // Reemplazar espacios por guiones
                    transformedRow[transformedKey] = row[key];
                });
                return transformedRow;
            });
            flattenedList.push(...transformedData); // Añadir todos los datos transformados al listado plano
        });
        // Devolver el listado plano en la respuesta
        responseHandler_1.ResponseHandler.success(res, flattenedList, 'File processed successfully');
    }
    catch (error) {
        console.error('Error processing file:', error);
        responseHandler_1.ResponseHandler.error(res, error);
    }
};
exports.uploadFileExcel = uploadFileExcel;
