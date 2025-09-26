"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageEntity = void 0;
class ImageEntity {
    constructor(id, metadata, url, fullUrl) {
        this.id = id;
        this.metadata = metadata;
        this.url = url;
        this.fullUrl = fullUrl;
    }
    getId() {
        return this.id;
    }
    getMetadata() {
        return Object.assign({}, this.metadata);
    }
    getUrl() {
        return this.url;
    }
    getFullUrl() {
        return this.fullUrl;
    }
    static create(metadata, url, fullUrl) {
        const id = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        return new ImageEntity(id, metadata, url, fullUrl);
    }
    toJSON() {
        return {
            id: this.id,
            metadata: this.metadata,
            url: this.url,
            fullUrl: this.fullUrl
        };
    }
}
exports.ImageEntity = ImageEntity;
