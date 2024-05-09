import { UsersSqlRepo } from './users.sql.repo';
import { HttpError } from '../middleware/errors.middleware';
import { type UserCreateDto } from '../entities/user';
import { type PrismaClient } from '@prisma/client';

// Creamos un mock de PrismaClient para simular la base de datos
const mockPrisma = {
  user: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: '1' }),
    findFirst: jest.fn().mockResolvedValue({ id: '1' }),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
} as unknown as PrismaClient;

// Creamos una instancia del repositorio con el mock de PrismaClient


describe('UsersSqlRepo', () => {
  const repo = new UsersSqlRepo(mockPrisma);

  describe('readAll', () => {
    it('should call prisma.findMany and return an empty array', async () => {
      const result = await repo.readAll();
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('readById', () => {
    it('should call prisma.findUnique with the provided ID', async () => {
      const result = await repo.readById('1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
      expect(result).toEqual({ id: '1' });
    });

    it('should throw an HttpError with status 404 if the user is not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.readById('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'User 2 not found')
      );
    });
  });

  describe('searchForLogin', () => {
    it('should call prisma.findFirst with the provided key and value', async () => {
      const result = await repo.searchForLogin('email', 'test@sample.com');
      expect(mockPrisma.user.findFirst).toHaveBeenCalled();
      expect(result).toEqual({ id: '1' });
    });

    it('should throw an HttpError with status 400 for invalid query parameters', async () => {
      await expect(
        repo.searchForLogin('invalid' as 'name', 'test')
      ).rejects.toThrow(
        new HttpError(400, 'Bad Request', 'Invalid query parameters')
      );
    });

    it('should throw an HttpError with status 404 for invalid email or password', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.searchForLogin('email', 'test')).rejects.toThrow(
        new HttpError(400, 'Bad Request', 'Invalid email or password')
      );
    });
  });

  describe('create', () => {
    it('should call prisma.create with the provided data', async () => {
      const data = {} as unknown as UserCreateDto;
      const result = await repo.create(data);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('should throw an Error and an error.message', async () => {
      const data = {} as unknown as UserCreateDto;

      const mockError = new Error('Database error');

      (mockPrisma.user.create as jest.Mock).mockRejectedValue(mockError)

      await expect(repo.create(data)).rejects.toThrow(new Error(`Failed to create user: ${mockError.message}`))
      
    })
  });

  describe('update', () => {
    it('should call prisma.update with the provided ID and data', async () => {
      const result = await repo.update('1', {});
      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('should throw an HttpError with status 404 if the user is not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.update('2', {})).rejects.toThrow(
        new HttpError(404, 'Not Found', 'User 2 not found')
      );
    });
  });

  describe('delete', () => {
    it('should call prisma.delete with the provided ID', async () => {
      const result = await repo.delete('1');
      expect(mockPrisma.user.delete).toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('should throw an HttpError with status 404 if the user is not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.delete('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'User 2 not found')
      );
    });
  });
});
