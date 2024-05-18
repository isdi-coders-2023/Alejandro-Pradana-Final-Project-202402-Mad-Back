import { Router as createRouter } from 'express';
import createDebug from 'debug';
import { type LessonsController } from '../controllers/lessons.controller.js';
import { type AuthInterceptor } from '../middleware/auth.interceptor.js';
import { type LessonsSqlRepo } from '../repositories/lessons.sql.repo.js';

const debug = createDebug('W9E:lessons:router');

export class LessonsRouter {
  router = createRouter();

  constructor(
    readonly controller: LessonsController,
    readonly authInterceptor: AuthInterceptor,
    readonly lessonsSqlRepo: LessonsSqlRepo
  ) {
    debug('Instantiated lesons router');

    // 1.authInterceptor.authentication protege las rutas, requiere una autentificación.
    // 2.authInterceptor.authorization protege las rutas de actualización y eliminación. Se encarga de comprobar si es usuario tiene permisos para realizar estas acciones.
    // 3.En cada ruta se vunculan los métodos de los controladores que correspondan a cada ruta definida. Se encargarán de manejar las request.
    this.router.get('/', authInterceptor.authentication.bind(authInterceptor),
    controller.getAll.bind(controller));

    this.router.get('/:id', authInterceptor.authentication.bind(authInterceptor),
    controller.getById.bind(controller));

    this.router.get('/search/:category', authInterceptor.authentication.bind(authInterceptor),
    controller.getByCategory.bind(controller));

    this.router.post('/', authInterceptor.authentication.bind(authInterceptor),
    controller.create.bind(controller));

    this.router.patch('/:id', authInterceptor.authentication.bind(authInterceptor),
    authInterceptor.authorization(lessonsSqlRepo, 'user').bind(authInterceptor),
    controller.update.bind(controller));

    this.router.delete('/:id', authInterceptor.authentication.bind(authInterceptor),
    authInterceptor.authorization(lessonsSqlRepo, 'user').bind(authInterceptor),
    controller.delete.bind(controller));

   
  }
}
