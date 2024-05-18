import { type NextFunction, type Request, type Response } from 'express';
import createDebug from 'debug';
import { HttpError } from './errors.middleware.js';

// Auth: framework autentificación, como JWT : JSON Web Token, es un objeto que reune la información del token . Payload es un tipo que representa la info util (payload = carga útil)
import { Auth, type Payload } from '../services/auth.services.js';

const debug = createDebug('W9E:auth:interceptor');
type Repo<T> = {
    readById(id: string): Promise<T | undefined>;
  }

export class AuthInterceptor {
  constructor() {
    debug('Instantiated auth interceptor');
  }


  


  // Método de autentificación para solicitudes.
  authentication(req: Request, _res: Response, next: NextFunction) {
    debug('Authenticating');

    // Se obtiene el encabezado de la autorización de la req. Vendrá con un token JWT necesario para el proceso. El encabezado Bearer viene por defecto con todos los tokens JWT.
    const data = req.get('Authorization');
    console.log(data);
    // Error en caso de expired o invalid. 
    const error = new HttpError(498, ' Token expired/invalid', 'Token invalid');

    // Condición, el encabezado debe empezar por 'Bearer ', sino error y se detiene el proceso.
    if (!data?.startsWith('Bearer ')) {
      next(error);
      return;
    }

    // Si es exitoso se extrae con la variable token, el token sin el encabezado como resultado de .slice(7)
    const token = data.slice(7);

    // Dentro del try se decodifica el token utilizando verifyJwt() del servicio de autentificacion de Auth. Si el token de verifica correctamente, se almacena la carga útil del mismo decodificado con req.body.payload en payload. 
    try {
      const payload = Auth.verifyJwt(token);
      req.body.payload = payload;
      next();
    } catch (err) {
      error.message = (err as Error).message;
      next(error);
    }
  }


  // Método de autentificación de rol Admin
  isAdmin(req: Request, res: Response, next: NextFunction) {
    debug('Checking if user is Admin');

    // Se extrae la carga útil o payload del token decodificado del cuerpo de la solicitud. as Payload, tipo de Auth. Una vez se tiene payload, de nuevo se extrae en esta caso role de payload para poder utilizarlo
    const { payload } = req.body as { payload: Payload };
    const { role } = payload;

    // Condición para verificar que no sea Admin. Al comprobarlo de manera exitosa pasará a next donde se crea un nuevo objeto HttpError con la info necesaria. 
    if (role !== 'Admin') {
      next(
        new HttpError(
          403,
          'Forbidden',
          'You are not allowed to access this resource'
        )
      );
      // Termina la ejecución de la función en condición de no admin, una vez comprobado que el usuario es Admin, se llama a next para que continue con el siguiente proceso.
      return;
    }

    next();
  }


  // Método de autorización para dar acceso a resursos dentro de la app en función del rol del usuario. El tipado indica que será T, extends se usa para especificar una restricción que cumpla con la condición que aparece a continuación id. Entonces, T puede ser cualquier objeto pero debe tener una prop id. 
  authorization<T extends { id: string }>(

    // Parámetros recibidos: repo donde se buscará el recurso y ownerKey clave del usuario, aparece como opcional. 
    repo: Repo<T>,
    ownerKey?: keyof T
  ) {

    return async (req: Request, res: Response, next: NextFunction) => {
      debug('Authorizing');

      // Extracción de payload que contiene los datos del usuario y se asigna a payload ahora con tipo Payload. Se utiliza el operador de propagación para recoger el resto de props del objeto req.body en rest que no tendrá payload. 
      const { payload, ...rest } = req.body as { payload: Payload };
      req.body = rest;

      // Extraccion de prop role de payload para verificar si es Admin si es así se pasa a next que lo lleva al sig middleware. En caso contrario se utiliza readById del repo  pasandole el id de las parametros de la solicitud. Si no se encuentra, es decir si item es undefined se lanza un error y si se encuentra se realiza una comprobación de autorización accediendo a ownerKey de item. En caso de que ownerKey no esté definido se utiliza la prop id, se hace una comparación de id y ownerId, si coinciden --> autorizado y se pasa a next, si no coinciden --> no estas permitido. 
      const { role } = payload;
      if (role === 'Admin') {
        next();
        return;
      }

      try {
        const item = await repo.readById(req.params.id);
        
        // La variable item podría resultar undefined, entonces se comprueba esto, si lo es se lanza un error indicando que el recurso no se encontró y de lo contrario se hace la aserción de tipo T
        if (item === undefined) {
          throw new HttpError(404, 'Not Found', 'Resource not found');
        }

        const typedItem: T = item; 

        // Se accede a la prop ownerKey de item-->typedItem si no se accede a la prop id de typedItem. Y el resultado se asigna a la variable ownerId. 
        const ownerId = ownerKey ? typedItem[ownerKey] : typedItem.id;

        if (payload.id !== ownerId) {
          next(
            new HttpError(
              403,
              'Forbidden',
              'You are not allowed to access this resource'
            )
          );
          return;
        }

        debug('Authorized', req.body);
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
