import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { processFileWithRoute } from '../../../../shared/utils/fileReader';
import { ResponseHandler } from '../../../../shared/utils/responseHandler';


export const uploadFile = (req: Request, res: Response) => {
  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded or file data missing' });
    }
    const buffer = Buffer.from(file, 'base64');
    const data = buffer.toString('utf-8');
    const processedData = processFileWithRoute(data);
    ResponseHandler.success(res, processedData, 'File processed successfully');
  } catch (error) {
    ResponseHandler.error(res, error);
  }
};


export const uploadFileExcel = (req: Request, res: Response) => {
  try {
    const { file } = req.body;

    // Verificar si el archivo fue enviado
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded or file data missing' });
    }

    // Decodificar el archivo base64 directamente a un buffer
    const buffer = Buffer.from(file, 'base64');

    // Leer el archivo Excel directamente desde el buffer
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    // Procesar todas las hojas y convertirlas en un único listado
    const sheets = workbook.SheetNames;
    const flattenedList: any[] = [];

    sheets.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const sheetData = xlsx.utils.sheet_to_json(sheet);

      // Transformar las claves de cada objeto
      const transformedData = sheetData.map((row: any) => {
        const transformedRow: any = {};
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
    ResponseHandler.success(res, flattenedList, 'File processed successfully');
  } catch (error) {
    console.error('Error processing file:', error);
    ResponseHandler.error(res, error);
  }
};
