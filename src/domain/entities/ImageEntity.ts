export interface ImageMetadata {
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

export class ImageEntity {
  private readonly id: string;
  private readonly metadata: ImageMetadata;
  private readonly url: string;
  private readonly fullUrl: string;

  constructor(id: string, metadata: ImageMetadata, url: string, fullUrl: string) {
    this.id = id;
    this.metadata = metadata;
    this.url = url;
    this.fullUrl = fullUrl;
  }

  public getId(): string {
    return this.id;
  }

  public getMetadata(): ImageMetadata {
    return { ...this.metadata };
  }

  public getUrl(): string {
    return this.url;
  }

  public getFullUrl(): string {
    return this.fullUrl;
  }

  public static create(metadata: ImageMetadata, url: string, fullUrl: string): ImageEntity {
    const id = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    return new ImageEntity(id, metadata, url, fullUrl);
  }

  public toJSON() {
    return {
      id: this.id,
      metadata: this.metadata,
      url: this.url,
      fullUrl: this.fullUrl
    };
  }
}