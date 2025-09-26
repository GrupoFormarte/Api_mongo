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
const utils_1 = require("../../../../src/shared/utils/utils");
// Mock the dynamic model
jest.mock('../../../../src/infrastructure/database/dynamicModel', () => {
    return jest.fn().mockImplementation(() => ({
        findById: jest.fn(),
    }));
});
describe('Utils', () => {
    describe('removeLastS', () => {
        it('should remove the last "s" from a word ending with "s"', () => {
            expect((0, utils_1.removeLastS)('books')).toBe('book');
            expect((0, utils_1.removeLastS)('cats')).toBe('cat');
            expect((0, utils_1.removeLastS)('words')).toBe('word');
        });
        it('should return the word unchanged if it does not end with "s"', () => {
            expect((0, utils_1.removeLastS)('book')).toBe('book');
            expect((0, utils_1.removeLastS)('cat')).toBe('cat');
            expect((0, utils_1.removeLastS)('word')).toBe('word');
        });
        it('should handle empty string', () => {
            expect((0, utils_1.removeLastS)('')).toBe('');
        });
        it('should handle single character "s"', () => {
            expect((0, utils_1.removeLastS)('s')).toBe('');
        });
        it('should handle words with multiple "s" at the end', () => {
            expect((0, utils_1.removeLastS)('glass')).toBe('glas');
            expect((0, utils_1.removeLastS)('class')).toBe('clas');
        });
    });
    describe('getData', () => {
        const mockFindById = jest.fn();
        const mockCreateDynamicModel = require('../../../../src/infrastructure/database/dynamicModel');
        beforeEach(() => {
            jest.clearAllMocks();
            mockCreateDynamicModel.mockReturnValue({
                findById: mockFindById,
            });
        });
        it('should return document when found', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockDocument = { _id: '123', name: 'Test' };
            mockFindById.mockResolvedValue(mockDocument);
            const result = yield (0, utils_1.getData)('users', '123');
            expect(mockCreateDynamicModel).toHaveBeenCalledWith('users', {});
            expect(mockFindById).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockDocument);
        }));
        it('should return undefined when document not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockFindById.mockRejectedValue(new Error('Not found'));
            const result = yield (0, utils_1.getData)('users', '123');
            expect(mockCreateDynamicModel).toHaveBeenCalledWith('users', {});
            expect(mockFindById).toHaveBeenCalledWith('123');
            expect(result).toBeUndefined();
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockFindById.mockRejectedValue(new Error('Database error'));
            const result = yield (0, utils_1.getData)('users', '123');
            expect(result).toBeUndefined();
        }));
    });
});
