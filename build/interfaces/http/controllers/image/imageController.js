"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = exports.proxyImage = exports.uploadMultipleImages = exports.uploadImage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const responseHandler_1 = require("../../../../shared/utils/responseHandler");
const uploadImage = (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return responseHandler_1.ResponseHandler.badRequest(res, 'No image data provided');
        }
        // Extract the base64 data (remove data:image/xyz;base64, if present)
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        // Create buffer from base64
        const imageBuffer = Buffer.from(base64Data, 'base64');
        // Generate unique filename
        const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
        // Ensure uploads directory exists
        const uploadsDir = path_1.default.join(process.cwd(), 'storage/uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        // Save the file
        const filepath = path_1.default.join(uploadsDir, filename);
        fs_1.default.writeFileSync(filepath, imageBuffer);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = `/uploads/${filename}`;
        const fullUrl = `${baseUrl}${imageUrl}`;
        responseHandler_1.ResponseHandler.success(res, { url: fullUrl }, 'Image uploaded successfully', 201);
    }
    catch (error) {
        console.error('Error uploading image:', error);
        responseHandler_1.ResponseHandler.error(res, error);
    }
};
exports.uploadImage = uploadImage;
const uploadMultipleImages = (req, res) => {
    try {
        const { images } = req.body;
        if (!images || !Array.isArray(images) || images.length === 0) {
            return responseHandler_1.ResponseHandler.badRequest(res, 'No images provided');
        }
        // Ensure uploads directory exists
        const uploadsDir = path_1.default.join(process.cwd(), 'storage/uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        const imageUrls = images.map((imageBase64, index) => {
            // Extract the base64 data
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            // Create buffer from base64
            const imageBuffer = Buffer.from(base64Data, 'base64');
            // Generate unique filename
            const filename = `image-${Date.now()}-${index}-${Math.round(Math.random() * 1E9)}.png`;
            // Save the file
            const filepath = path_1.default.join(uploadsDir, filename);
            fs_1.default.writeFileSync(filepath, imageBuffer);
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const imageUrl = `/uploads/${filename}`;
            return {
                url: imageUrl,
                fullUrl: `${baseUrl}${imageUrl}`
            };
        });
        responseHandler_1.ResponseHandler.success(res, { urls: imageUrls }, 'Images uploaded successfully', 201);
    }
    catch (error) {
        console.error('Error uploading images:', error);
        responseHandler_1.ResponseHandler.error(res, error);
    }
};
exports.uploadMultipleImages = uploadMultipleImages;
const proxyImage = (req, res) => {
    // Proxy image functionality if needed
    res.status(501).json({ message: 'Proxy image not implemented yet' });
};
exports.proxyImage = proxyImage;
class ImageController {
    constructor() {
        this.uploadImage = exports.uploadImage;
        this.uploadMultipleImages = exports.uploadMultipleImages;
        this.proxyImage = exports.proxyImage;
    }
}
exports.ImageController = ImageController;
