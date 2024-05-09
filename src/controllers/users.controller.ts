// Controller. Modelo MVC. Maneja solicitudes entrantes (requests) del cliente, las procesa y da respuesta. Este maneja operaciones realcionadas con la gestión de usuarios, a saber: autentificación de usuarios, lectura, creación, actualización y eliminación. 

import createDebug from 'debug';
import { type User, type UserCreateDto } from '../entities/user.js';
import { type NextFunction, type Request, type Response } from 'express';
import { HttpError } from '../middleware/errors.middleware.js';
import { Auth } from '../services/auth.services.js';
import { userCreateDtoSchema, userUpdateDtoSchema } from '../entities/user.schema.js'; 
import { BaseController } from './base.controller.js';
import { type WithLoginRepo } from '../repositories/type.repo.js';

const debug = createDebug('W9E:users:controller');

// Define una clase UsersController que extiende la clase BaseController. Herencia. Especificando los tipos entre <>, cuando el controller haga operaciones de obtenció, actualización o eliminación utiliza User y la crear el otro.
export class UsersController extends BaseController<User, UserCreateDto>{
 
  constructor(protected readonly repo: WithLoginRepo<User,UserCreateDto>) {
     super(repo, userCreateDtoSchema, userUpdateDtoSchema) // UserCreateDtoSchema, userUpdateDtoSchema;
    
    debug('Instantiated user controller');
  }

  

  async login(req: Request, res: Response, next: NextFunction) {
    
    // Desestructuración de la solicitud. Extrae email y password del cuerpo de la solicitud y los asigna a las variables email y password. Estos dos datos se esperan en formato UserCreateDto.
    const { email, password } = req.body as UserCreateDto;

    // Validación. Esta guarda evita que falten email y/o password, se lanza error sino. 
    if (!email || !password) {
      next(new HttpError(400, 'Bad Request', 'Email and password are required'));
      return;
    }

    // Se hace instancia del repo para utilizar searchForLogin, buscará un usuario con email en la db.
    
      const user = await this.repo.searchForLogin('email', email);
      

      try {
         // Lanza error usuario no encontrado.
      if (!user) {
        next(new HttpError(401, 'Unauthorized', 'Invalid email or password'));
        return;
      }

    // Lanza error contraseña incorrecta. 
      if (!(await Auth.compare(password, user.password!))) {
        next(new HttpError(401, 'Unauthorized', 'Invalid email or password'));
        return;
      }

      const token = Auth.signJwt({
        id: user.id!,
        role: user.role!
      })
    // Si la busqueda resulta exitosa se devuelve la respuesta HTTP 200 con mensaje 
      res.status(200).json({ token, message: 'Login successful' });
      } catch (error) {
        next(error);
      }
     
    }

    async create(req: Request, res: Response, next: NextFunction) {
      // Verifica si contraseña en el cuerpo de la solicitud y si es un string. Si no se cumplen estos requisitos se devuelve un error utilizando next en este caso.  
    if (!req.body.password || typeof req.body.password !== 'string') {
      next(
        new HttpError(
          400,
          'Bad Request',
          'Password is required and must be a string'
        )
      );
      return;
    }

    // SEGURIDAD: HASHING: Si la contraseña es válida, pasa a ser hasheada utilizando Auth.hash() de la clase Auth.
    // Tambien se crea un objeto userData que contiene los datos del usuario proporcionados en req.body como UserCreateDto de nuevo. Entonces la contraseña ya hasheada se asigna a la propiedad password de user
   try {
    
      const userData = req.body as UserCreateDto; // 
      userData.password = await Auth.hash(userData.password); 

      // Ahora se usa el método create() del repo para crear un nuevo usuario utilizando los nuevos datos de userData.
      const newUser = await this.repo.create(userData);
      res.status(201).json(newUser);

     
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {

    // Verifica si hay una contraseña en la solicitud y si es un 'string', si se cumple  esta se hashea con Auth.hash(). Ahorra mucho codigo al hber instanciado la clase que ahora se llama con super. se le incluye el metodo y se le pasan los argumentos 
    if (req.body.password && typeof req.body.password === 'string') {
      req.body.password = await Auth.hash(req.body.password as string)
    }

    await super.update(req, res, next);
  }

 }

 

