"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
class UserEntity {
    constructor(metadata) {
        this.metadata = metadata;
    }
    static create(metadata) {
        return new UserEntity(Object.assign(Object.assign({}, metadata), { createdAt: new Date() }));
    }
    getMetadata() {
        return Object.assign({}, this.metadata);
    }
    validate() {
        // Basic validation rules
        if (!this.metadata.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
            return false;
        if (!this.metadata.number_id || this.metadata.number_id.length < 5)
            return false;
        if (!this.metadata.name || !this.metadata.last_name)
            return false;
        if (!this.metadata.cellphone.match(/^\+?[1-9]\d{6,14}$/))
            return false;
        // if (!['M', 'F', 'O'].includes(this.metadata.gender))
        //   return false;
        if (!this.metadata.password || this.metadata.password.length < 6)
            return false;
        return true;
    }
}
exports.UserEntity = UserEntity;
