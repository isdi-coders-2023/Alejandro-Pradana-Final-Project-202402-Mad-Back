import { type Request, type Response } from 'express';
import { ErrorsMiddleware, HttpError } from './errors.middleware';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Mocks de req, res y next paraa utilizar como argumentos en los test.
const req = {} as unknown as Request;
const res = {
  json: jest.fn(),
  status: jest.fn(),
} as unknown as Response;
const next = jest.fn();

// Se crea una instancia de ErrorsMiddleware y luego se prueba si es una instancia de la misma clase; comprobación creación correcta. Después se finge un caso para comprobar que el metodo handle() con un objeto HttpError responda correctamente(res.status) obteniendo el json como respuesta. 
describe('Given a instance of the class ErrorsMiddleware', () => {
  const middleware = new ErrorsMiddleware();
  test('Then it should be instance of the class', () => {
    expect(middleware).toBeInstanceOf(ErrorsMiddleware);
  });
  describe('When we use the method handle with a HttpError', () => {
    test('Then it should call res.status 404', () => {
      const error = new HttpError(404, 'Not Found', 'Article not found');
      middleware.handle(error, req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });
  });

// Otro caso hipotético con el método handle en esta ocasión con un objeto error de prisma, esperamos la respuesta adecuada. 
  describe('When we use the method handle with a PrismaClientKnownRequestError', () => {
    test('Then it should call res.status 404', () => {
      const error = new PrismaClientKnownRequestError('error', {
        code: 'P2025',
        clientVersion: '3.0.0',
      });
      middleware.handle(error, req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
    });
  });

// El último caso comprueba que el método handle() con un objeto Error se ajusta correctamente al estado de respuesta y devuelve un json como respuesta
  describe('When we use the method handle with a Error', () => {
    test('Then it should call res.status with 500', () => {
      const error = new Error('Something went wrong');
      middleware.handle(error, req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
