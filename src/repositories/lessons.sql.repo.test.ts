import { type PrismaClient } from '@prisma/client';
import { HttpError } from '../middleware/errors.middleware';
import { LessonsSqlRepo } from './lessons.sql.repo';
import { type Category, type LessonCreateDto } from '../entities/lesson';

const mockPrisma = {
  lesson: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: '1' }),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
} as unknown as PrismaClient;

describe('Given a instance of the class ArticlesSqlRepo', () => {
  const repo = new LessonsSqlRepo(mockPrisma);

  test('Then it should be instance of the class', () => {
    expect(repo).toBeInstanceOf(LessonsSqlRepo);
  });

  describe('When we use the method readAll', () => {
    test('Then it should call prisma.findMany', async () => {
      const result = await repo.readAll();
      expect(mockPrisma.lesson.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('When we use the method readById with a valid ID', () => {
    test('Then it should call prisma.findUnique', async () => {
      const result = await repo.readById('1');
      expect(mockPrisma.lesson.findUnique).toHaveBeenCalled();
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('When we use the method readById with an invalid ID', () => {
    test('Then it should throw an error', async () => {
      (mockPrisma.lesson.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.readById('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Lesson 2 not found')
      );
    });
  });

  describe('When we use the method create', () => {
    test('Then it should call prisma.create', async () => {
      const data = {} as unknown as LessonCreateDto;
      const result = await repo.create(data);
      expect(mockPrisma.lesson.create).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('When we use the method update with a valid ID', () => {
    test('Then it should call prisma.update', async () => {
      const result = await repo.update('1', {});
      expect(mockPrisma.lesson.update).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('When we use the method update with an invalid ID', () => {
    test('Then it should throw an error', async () => {
      (mockPrisma.lesson.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.update('2', {})).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Lesson 2 not found')
      );
    });
  });

  describe('When we use the method delete with a valid ID', () => {
    test('Then it should call prisma.delete', async () => {
      const result = await repo.delete('1');
      expect(mockPrisma.lesson.delete).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('When we use the method delete with an invalid ID', () => {
    test('Then it should throw an error', async () => {
      (mockPrisma.lesson.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.delete('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Lesson 2 Not Found')
      );
    });
  });

  describe('When we use the method readByCategory', () => {
    test('Then it should call prisma.findMany with the specified category', async () => {
      const category : Category = 'Science';
      const result = await repo.readByCategory(category);
      expect(mockPrisma.lesson.findMany).toHaveBeenCalledWith({
        where: { category },
        select: expect.any(Object) as unknown, 
      });
      expect(result).toEqual([]); 
    });

      test('Then it should throw an error if no lesson is found for the specified category', async () => {
      const category = 'Science';
      (mockPrisma.lesson.findMany as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.readByCategory(category)).rejects.toThrow(
        new HttpError(404, 'Not Found', `Lesson ${category} not found`)
      );
    });
  });
});
