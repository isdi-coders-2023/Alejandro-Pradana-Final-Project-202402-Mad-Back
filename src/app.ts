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

  const usersRepo = new UsersSqlRepo(prisma)
  const usersController = new UsersController(usersRepo)
  const usersRouter = new UsersRouter(
    usersController,
    authInterceptor)
  app.use('/users', usersRouter.router)

  const errorsMiddleware = new ErrorsMiddleware()
  app.use(errorsMiddleware.handle.bind(errorsMiddleware))
}
