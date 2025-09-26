import { ImageEntity, ImageMetadata } from '../../domain/entities/ImageEntity';

export interface ImageStoragePort {
  saveImage(
    imageBuffer: Buffer, 
    metadata: ImageMetadata, 
    requestInfo: { protocol: string; host: string }
  ): Promise<{ url: string; fullUrl: string }>;
  
  saveMultipleImages(
    images: Array<{ buffer: Buffer; metadata: ImageMetadata }>, 
    requestInfo: { protocol: string; host: string }
  ): Promise<Array<{ url: string; fullUrl: string }>>;
}

export class ImageService {
  constructor(private readonly imageStorage: ImageStoragePort) {}

  async uploadImage(imageBase64: string, requestInfo: { protocol: string; host: string }): Promise<ImageEntity> {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const metadata: ImageMetadata = {
      filename: `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`,
      mimeType: 'image/png',
      size: imageBuffer.length,
      createdAt: new Date()
    };

    const { url, fullUrl } = await this.imageStorage.saveImage(imageBuffer, metadata, requestInfo);
    return ImageEntity.create(metadata, url, fullUrl);
  }

  async uploadMultipleImages(imagesBase64: string[], requestInfo: { protocol: string; host: string }): Promise<ImageEntity[]> {
    const imageBuffers = imagesBase64.map((imageBase64, index) => {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Extract mime type from base64 string
      const mimeType = imageBase64.match(/^data:(.*?);/)?.[1] || 'image/png';
      const extension = mimeType.split('/')[1] || 'png';
      
      const metadata: ImageMetadata = {
        filename: `image-${Date.now()}-${index}-${Math.round(Math.random() * 1E9)}.${extension}`,
        mimeType: mimeType,
        size: buffer.length,
        createdAt: new Date()
      };
      return { buffer, metadata };
    });

    const savedImages = await this.imageStorage.saveMultipleImages(imageBuffers, requestInfo);
    return savedImages.map((saved, index) => 
      ImageEntity.create(imageBuffers[index].metadata, saved.url, saved.fullUrl)
    );
  }
}