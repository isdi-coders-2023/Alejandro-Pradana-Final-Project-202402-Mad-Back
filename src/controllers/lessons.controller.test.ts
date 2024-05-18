import { type Request, type Response } from 'express';
import { type LessonsSqlRepo } from '../repositories/lessons.sql.repo';
import { LessonsController } from './lessons.controller';
import { type Category } from '@prisma/client';

describe('Given a instance of the class LessonsController', () => {
  const repo = {
    create: jest.fn(),
    getByCategory: jest.fn(),
  } as unknown as LessonsSqlRepo;

  const userRepo = {
      readAll: jest.fn(),
    readById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
  const req = {
    params: { category: 'testCategory' },
    body: {},
  } as unknown as Request;

  const res = {
    json: jest.fn(),
    status: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  const controller = new LessonsController(repo, userRepo);

  test('Then it should be instance of the class', () => {
    expect(controller).toBeInstanceOf(LessonsController);
  });


  describe('When we use the method create', () => {
    test('Then it should call repo.create', async () => {
      const lesson = { title: 'title', userId: 'test' };
      const validateLesson = { ...lesson, content: '' };
      req.body = { ...lesson, payload: { id: 'test' } };
      (repo.create as jest.Mock).mockResolvedValue(lesson);
      await controller.create(req, res, next);
      expect(repo.create).toHaveBeenCalledWith(validateLesson);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(lesson);
    });
  });

 
  // Describe('When getByCategory is called', () => {
  //   test('Then it should call repo.readByCategory', async () => {
  //     const result = [{ title: 'Fake lesson' }, { title: 'Lesson fake' }];
  //     (repo.readByCategory as jest.Mock).mockResolvedValue(result);

  //     await controller.getByCategory(req, res, next);

  //     expect(repo.readByCategory).toHaveBeenCalledWith('TestCategory'); 
  //     expect(res.json).toHaveBeenCalledWith(result);
  //   });

  //   test('Then it should handle errors by calling next', async () => {
  //     const error = new Error('Something went wrong');
  //     (repo.readByCategory as jest.Mock).mockRejectedValue(error);

  //     await controller.getByCategory(req, res, next);

  //     expect(next).toHaveBeenCalledWith(error);
  //   });
  // });

});
