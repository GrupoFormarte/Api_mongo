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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicRepository = void 0;
const DynamicModelFactory_1 = require("../factories/DynamicModelFactory");
class DynamicRepository {
    constructor() {
        this.modelFactory = DynamicModelFactory_1.DynamicModelFactory.getInstance();
    }
    getModel(collectionName, schema = {}, options = {}) {
        return this.modelFactory.getModel(collectionName, schema, options);
    }
    findById(collectionName_1, id_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, id, schema = {}) {
            const model = this.getModel(collectionName, schema);
            return yield model.findById(id);
        });
    }
    findOne(collectionName_1, query_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, query, schema = {}) {
            const model = this.getModel(collectionName, schema);
            return yield model.findOne(query);
        });
    }
    find(collectionName_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, query = {}, projection = {}, schema = {}) {
            const model = this.getModel(collectionName, schema);
            return yield model.find(query, projection);
        });
    }
    findByIds(collectionName_1, ids_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, ids, schema = {}) {
            const model = this.getModel(collectionName, schema);
            return yield model.find({ _id: { $in: ids } });
        });
    }
    create(collectionName_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, data, schema = {}) {
            const model = this.getModel(collectionName, schema);
            const document = new model(data);
            return yield document.save();
        });
    }
    updateById(collectionName_1, id_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, id, data, schema = {}) {
            const model = this.getModel(collectionName, schema, { useById: true });
            return yield model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        });
    }
    updateOne(collectionName_1, query_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, query, data, schema = {}) {
            const model = this.getModel(collectionName, schema);
            return yield model.findOneAndUpdate(query, { $set: data }, { new: true });
        });
    }
    deleteById(collectionName_1, id_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, id, schema = {}) {
            const model = this.getModel(collectionName, schema);
            return yield model.findByIdAndDelete(id);
        });
    }
    bulkUpdate(collectionName_1, students_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, students, schema = {}) {
            const model = this.getModel(collectionName, schema);
            const updated = [];
            const notFound = [];
            for (const student of students) {
                const { id_estudiante } = student, rest = __rest(student, ["id_estudiante"]);
                if (!id_estudiante)
                    continue;
                const result = yield model.findOneAndUpdate({ id_estudiante }, { $set: rest }, { new: true });
                if (result) {
                    updated.push(result);
                }
                else {
                    notFound.push(id_estudiante);
                }
            }
            return { updated, notFound };
        });
    }
    bulkCreateUnique(collectionName_1, students_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, students, schema = {}) {
            const model = this.getModel(collectionName, schema);
            const ids = students.map((s) => s.id_estudiante);
            const existing = yield model.find({ id_estudiante: { $in: ids } }).lean();
            const existingIds = new Set(existing.map((e) => e.id_estudiante));
            const toInsert = students
                .filter((s) => !existingIds.has(s.id_estudiante))
                .map((s) => {
                const clean = Object.assign({}, s);
                if (clean.id === null || clean.id === undefined) {
                    delete clean.id;
                }
                return clean;
            });
            let created = [];
            if (toInsert.length > 0) {
                created = yield model.insertMany(toInsert);
            }
            return { created, existing };
        });
    }
    searchByField(collectionName_1, field_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, field, value, schema = {}) {
            const model = this.getModel(collectionName, schema);
            const query = { [field]: value };
            return yield model.find(query);
        });
    }
    multiFieldSearch(collectionName_1, query_1, fields_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, query, fields, schema = {}) {
            const model = this.getModel(collectionName, schema);
            const searchPromises = fields.map(field => model.find({ [field]: new RegExp(query, 'i') }));
            const results = yield Promise.all(searchPromises);
            return results.flat();
        });
    }
    findByCategory(collectionName_1, category_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, category, schema = {}) {
            const model = this.getModel(collectionName, schema);
            return yield model.find({ category });
        });
    }
    // New utility methods
    getCacheStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.modelFactory.getCacheStats();
        });
    }
    getCollectionStats(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.modelFactory.getCollectionStats(collectionName);
        });
    }
    invalidateCache(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.modelFactory.invalidateCache(collectionName);
        });
    }
    preloadModels(collections) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.modelFactory.preloadModels(collections);
        });
    }
}
exports.DynamicRepository = DynamicRepository;
