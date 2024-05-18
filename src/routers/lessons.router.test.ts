import { type LessonsController } from "../controllers/lessons.controller"
import { type AuthInterceptor } from "../middleware/auth.interceptor";
import { type LessonsSqlRepo } from "../repositories/lessons.sql.repo";
import { LessonsRouter } from "./lessons.router";

describe('Given a instance of the class LessonsRouter', () => {
  const controller = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByCategory: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as LessonsController;
  const authInterceptor = {
    authentication: jest.fn(),
    authorization: jest.fn().mockReturnValue(jest.fn()),
  } as unknown as AuthInterceptor;
  const repo = {} as unknown as LessonsSqlRepo;

  const router = new LessonsRouter(controller, authInterceptor, repo);
  test('Then it should be instance os the class', () => {
    expect(router).toBeInstanceOf(LessonsRouter);
  })
})
