"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const createDynamicModel = (collectionName, schemaDefinition) => {
    if (mongoose_1.models[collectionName]) {
        return mongoose_1.models[collectionName];
    }
    const schema = new mongoose_1.Schema(schemaDefinition, { strict: false });
    return (0, mongoose_1.model)(collectionName, schema, collectionName);
};
exports.default = createDynamicModel;
