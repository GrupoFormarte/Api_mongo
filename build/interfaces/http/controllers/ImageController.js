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
exports.ImageController = void 0;
const ImageService_1 = require("../../../application/services/ImageService");
const FileSystemImageStorage_1 = require("../../../infrastructure/database/FileSystemImageStorage");
const responseHandler_1 = require("../../../shared/utils/responseHandler");
class ImageController {
    constructor() {
        const imageStorage = new FileSystemImageStorage_1.FileSystemImageStorage();
        this.imageService = new ImageService_1.ImageService(imageStorage);
    }
    uploadImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { imageBase64 } = req.body;
                const requestInfo = { protocol: req.protocol, host: req.get('host') || '' };
                const result = yield this.imageService.uploadImage(imageBase64, requestInfo);
                responseHandler_1.ResponseHandler.success(res, result);
            }
            catch (error) {
                responseHandler_1.ResponseHandler.error(res, error);
            }
        });
    }
    uploadMultipleImages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { imagesBase64 } = req.body;
                const requestInfo = { protocol: req.protocol, host: req.get('host') || '' };
                const result = yield this.imageService.uploadMultipleImages(imagesBase64, requestInfo);
                responseHandler_1.ResponseHandler.success(res, result);
            }
            catch (error) {
                responseHandler_1.ResponseHandler.error(res, error);
            }
        });
    }
}
exports.ImageController = ImageController;
