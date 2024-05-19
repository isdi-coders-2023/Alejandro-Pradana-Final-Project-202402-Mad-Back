import { UsersController } from './users.controller';
import { type UsersSqlRepo } from '../repositories/users.sql.repo';
import { Auth } from '../services/auth.services';
import { HttpError } from '../middleware/errors.middleware';
import { type Request, type Response } from 'express';



describe('Given an instance of the UsersController class', () => {
  const repo: UsersSqlRepo = {
    readAll: jest.fn(),
    readById: jest.fn(),
    searchForLogin: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as UsersSqlRepo;

  jest.spyOn(Auth, 'signJwt').mockReturnValue('token');

  const req = {} as unknown as Request;
  const res: Response = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn();

  const controller = new UsersController(repo);

  test('Should be an instance of the UsersController class', () => {
    expect(controller).toBeInstanceOf(UsersController);
  });

  describe('When calling the login method', () => {
    describe('And the request body is not valid', () => {
      test('Should call next with an error', async () => {
        req.body = {};
        await controller.login(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      });
    });

    //  Describe('And an error occurs during the login process', () => {
    //   test('Should call next with the error', async () => {
    //     req.body = { email: 'test@example.com', password: 'password' };
    //     (repo.searchForLogin as jest.Mock).mockRejectedValue(new HttpError(500, 'Internal Server Error', 'An unexpected error occurred'));
    //     await controller.login(req, res, next);
    //     expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    //   });
    // });

    describe('And the user is found and password is valid', () => {
      test('Should call Auth.signJwt and return HTTP 200 with token and message', async () => {
        const user = { id: '1', role: 'user', password: 'hashedFakePassword'};
        req.body = { email: 'test@example.com', password: 'password'};
        (repo.searchForLogin as jest.Mock).mockResolvedValue(user);
  
        Auth.compare = jest.fn().mockResolvedValue(true);

        await controller.login(req, res, next);

        expect(Auth.signJwt).toHaveBeenCalledWith({
          id: user.id,
          role: user.role
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: 'token', message: 'Login successful'});
      });
    });

    // Simulación de inicio de sesión: req.body = {email, password}, después se simula el comportamiento de searchForLogin y con .mock...(null) se indica que la busqueda de usuario no devuelve nada, no se encuentra. Continua llamando al método login del controller pasándole req, res y next. Por último se verifica que la función next sea llamada con un objeto de HttpError
    describe('And the user is not found', () => {
      test('Should call next with an error', async () => {
        req.body = { email: 'test@example.com', password: 'password' };
        (repo.searchForLogin as jest.Mock).mockResolvedValue(null);
        await controller.login(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      });
    });

    describe('And the password is invalid', () => {
      test('Should call next with an error', async () => {
        req.body = { email: 'test@example.com', password: 'fakePassword' };
        const user = { id: '1', password: 'password' };
        (repo.searchForLogin as jest.Mock).mockResolvedValue(user);
        Auth.compare = jest.fn().mockResolvedValue(false);
        await controller.login(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      });
    });

   

  });

    describe('When calling the create method', () => {
    describe('And the request body is not valid', () => {
      test('Should call next with an error', async () => {
        req.body = { name: 'test' };
        await controller.create(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      });
    });


    describe('And an error occurs during the create process', () => {
      test('Should call next with an error', async () => {
        req.body = { name: 'test', password: 'testPassword' };
        (repo.create as jest.Mock).mockRejectedValue(new Error());
        await controller.create(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    describe('And an error occurs during the create process', () => {
      test('Should call next with the error', async () => {
        req.body = { name: 'test', password: 'fakePassword' };
        (repo.create as jest.Mock).mockRejectedValue(new Error('Create error'));
        await controller.create(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error('Create error'));
      });
    });
  });

  describe('When we use the method update', () => {
    test('Then it should call repo.update', async () => {
      Auth.hash = jest.fn().mockResolvedValue('hashedPassword');
      const user = { id: '1', name: 'test', password: 'test' };
      const finalUser = { ...user, password: 'hashedPassword' };
      req.params = { id: '1' };
      req.body = { ...user, id: req.params.id };
      (repo.update as jest.Mock).mockResolvedValue(finalUser);
      await controller.update(req, res, next);
      expect(Auth.hash).toHaveBeenCalledWith('test');
      expect(repo.update).toHaveBeenCalledWith('1', finalUser);
      expect(res.json).toHaveBeenCalledWith(finalUser);
    });
  });

});
