import { removeLastS, getData } from '../../../../src/shared/utils/utils';

// Mock the dynamic model
jest.mock('../../../../src/infrastructure/database/dynamicModel', () => {
  return jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
  }));
});

describe('Utils', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('removeLastS', () => {
    it('should remove the last "s" from a word ending with "s"', () => {
      expect(removeLastS('books')).toBe('book');
      expect(removeLastS('cats')).toBe('cat');
      expect(removeLastS('words')).toBe('word');
    });

    it('should return the word unchanged if it does not end with "s"', () => {
      expect(removeLastS('book')).toBe('book');
      expect(removeLastS('cat')).toBe('cat');
      expect(removeLastS('word')).toBe('word');
    });

    it('should handle empty string', () => {
      expect(removeLastS('')).toBe('');
    });

    it('should handle single character "s"', () => {
      expect(removeLastS('s')).toBe('');
    });

    it('should handle words with multiple "s" at the end', () => {
      expect(removeLastS('glass')).toBe('glas');
      expect(removeLastS('class')).toBe('clas');
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

    it('should return document when found', async () => {
      const mockDocument = { _id: '123', name: 'Test' };
      mockFindById.mockResolvedValue(mockDocument);

      const result = await getData('users', '123');

      expect(mockCreateDynamicModel).toHaveBeenCalledWith('users', {});
      expect(mockFindById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockDocument);
    });

    it('should return undefined when document not found', async () => {
      mockFindById.mockRejectedValue(new Error('Not found'));

      const result = await getData('users', '123');

      expect(mockCreateDynamicModel).toHaveBeenCalledWith('users', {});
      expect(mockFindById).toHaveBeenCalledWith('123');
      expect(result).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      mockFindById.mockRejectedValue(new Error('Database error'));

      const result = await getData('users', '123');

      expect(result).toBeUndefined();
    });
  });
});