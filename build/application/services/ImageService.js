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
exports.ImageService = void 0;
const ImageEntity_1 = require("../../domain/entities/ImageEntity");
class ImageService {
    constructor(imageStorage) {
        this.imageStorage = imageStorage;
    }
    uploadImage(imageBase64, requestInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const metadata = {
                filename: `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`,
                mimeType: 'image/png',
                size: imageBuffer.length,
                createdAt: new Date()
            };
            const { url, fullUrl } = yield this.imageStorage.saveImage(imageBuffer, metadata, requestInfo);
            return ImageEntity_1.ImageEntity.create(metadata, url, fullUrl);
        });
    }
    uploadMultipleImages(imagesBase64, requestInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageBuffers = imagesBase64.map((imageBase64, index) => {
                var _a;
                const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                // Extract mime type from base64 string
                const mimeType = ((_a = imageBase64.match(/^data:(.*?);/)) === null || _a === void 0 ? void 0 : _a[1]) || 'image/png';
                const extension = mimeType.split('/')[1] || 'png';
                const metadata = {
                    filename: `image-${Date.now()}-${index}-${Math.round(Math.random() * 1E9)}.${extension}`,
                    mimeType: mimeType,
                    size: buffer.length,
                    createdAt: new Date()
                };
                return { buffer, metadata };
            });
            const savedImages = yield this.imageStorage.saveMultipleImages(imageBuffers, requestInfo);
            return savedImages.map((saved, index) => ImageEntity_1.ImageEntity.create(imageBuffers[index].metadata, saved.url, saved.fullUrl));
        });
    }
}
exports.ImageService = ImageService;
