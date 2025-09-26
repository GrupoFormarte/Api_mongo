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
exports.FileSystemImageStorage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FileSystemImageStorage {
    constructor(baseDir = process.cwd()) {
        this.uploadsDir = path_1.default.join(baseDir, 'storage/uploads');
        this.ensureUploadsDirectory();
    }
    ensureUploadsDirectory() {
        if (!fs_1.default.existsSync(this.uploadsDir)) {
            fs_1.default.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
    saveImage(imageBuffer, metadata, requestInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const filepath = path_1.default.join(this.uploadsDir, metadata.filename);
            yield fs_1.default.promises.writeFile(filepath, imageBuffer);
            const baseUrl = `${requestInfo.protocol}://${requestInfo.host}`;
            return {
                url: `${baseUrl}/uploads/${metadata.filename}`,
                fullUrl: `${baseUrl}/uploads/${metadata.filename}`
            };
        });
    }
    saveMultipleImages(images, requestInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(images.map(({ buffer, metadata }) => this.saveImage(buffer, metadata, requestInfo)));
        });
    }
}
exports.FileSystemImageStorage = FileSystemImageStorage;
