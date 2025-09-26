import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { ResponseHandler } from '../../../../shared/utils/responseHandler';

export const uploadImage = (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return ResponseHandler.badRequest(res, 'No image data provided');
    }

    // Extract the base64 data (remove data:image/xyz;base64, if present)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
    // Create buffer from base64
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'storage/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Save the file
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `/uploads/${filename}`;
    const fullUrl = `${baseUrl}${imageUrl}`;

    ResponseHandler.success(
      res,
      { url:fullUrl },
      'Image uploaded successfully',
      201
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    ResponseHandler.error(res, error);
  }
};

export const uploadMultipleImages = (req: Request, res: Response) => {
  try {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return ResponseHandler.badRequest(res, 'No images provided');
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'storage/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const imageUrls = images.map((imageBase64: string, index: number) => {
      // Extract the base64 data
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      // Create buffer from base64
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Generate unique filename
      const filename = `image-${Date.now()}-${index}-${Math.round(Math.random() * 1E9)}.png`;
      
      // Save the file
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, imageBuffer);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `/uploads/${filename}`;
      return {
        url: imageUrl,
        fullUrl: `${baseUrl}${imageUrl}`
      };
    });

    ResponseHandler.success(
      res,
      { urls: imageUrls },
      'Images uploaded successfully',
      201
    );
  } catch (error) {
    console.error('Error uploading images:', error);
    ResponseHandler.error(res, error);
  }
};

export const proxyImage = (req: Request, res: Response) => {
  // Proxy image functionality if needed
  res.status(501).json({ message: 'Proxy image not implemented yet' });
};

export class ImageController {
  uploadImage = uploadImage;
  uploadMultipleImages = uploadMultipleImages;
  proxyImage = proxyImage;
}