import { type PrismaClient } from '@prisma/client';
import cors from 'cors';
import createDebug from 'debug';
import express, { type Express } from 'express';
import morgan from 'morgan';

import { UsersSqlRepo } from './repositories/users.sql.repo.js';
import { UsersController } from './controllers/users.controller.js';
import { UsersRouter } from './routers/users.router.js';
import { ErrorsMiddleware } from './middleware/errors.middleware.js';
import { AuthInterceptor } from './middleware/auth.interceptor.js';
import { FilesInterceptor } from './middleware/files.interceptor.js';
import { FilesRouter } from './routers/files.router.js';
import { FilesController } from './controllers/files.controller.js';
import { LessonsSqlRepo } from './repositories/lessons.sql.repo.js';
import { LessonsController } from './controllers/lessons.controller.js';
import { LessonsRouter } from './routers/lessons.router.js';

const debug = createDebug('W9E:app');
export const createApp = () => {
  debug('Creating app');
  return express();
};

export const startApp = (app: Express, prisma: PrismaClient) => {
  debug('Starting app');
  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json())
  app.use(express.static('public'));

  const authInterceptor = new AuthInterceptor();
  const filesInterceptor = new FilesInterceptor();

  const usersRepo = new UsersSqlRepo(prisma)
  const usersController = new UsersController(usersRepo)
  const usersRouter = new UsersRouter(
    usersController,
    authInterceptor,
    filesInterceptor
  )
  app.use('/users', usersRouter.router)

  const lessonsRepo = new LessonsSqlRepo(prisma);
  const lessonsController = new LessonsController(lessonsRepo, usersRepo);
  const lessonsRouter = new LessonsRouter(
    lessonsController,
    authInterceptor,
    lessonsRepo
  )
  app.use('/lessons', lessonsRouter.router);
  
  const filesController = new FilesController();
  const filesRouter = new FilesRouter(filesController, filesInterceptor)
  app.use('/files', filesRouter.router)

  const errorsMiddleware = new ErrorsMiddleware()
  app.use(errorsMiddleware.handle.bind(errorsMiddleware))
}
