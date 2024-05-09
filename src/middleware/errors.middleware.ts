import { type NextFunction, type Request, type Response } from 'express'; 
import createDebug from 'debug'; 
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; 

const debug = createDebug('W9E:errors:middleware'); 


// Intermediario entre cliente y servidor o función que se ejecuta entre la solicitud y la respuesta --> Middleware en este caso de errores. Maneja diferentes tipos de errores, definidos por la clase HttpError y los errores de Prisma. Generará una respuesta con el código de estado HTTP correspondiente. 


export class HttpError extends Error { // Clase HttpError hereda de Error y tiene ademas:
  constructor(public status: number, // Atributo para almacenar el código de estado HTTP del error
    public statusMessage: string, // Atributo para almacenar el mensaje de estado HTTP del error
    message?: string, // El mensaje de error
    options?: ErrorOptions // Opciones adicionales para el error
  ) {
    super(message, options); 
  }
}

export class ErrorsMiddleware { 
  constructor() { 
    debug('Instantiated errors middleware'); 
  }

  // Método para manejar los errores. Status por defecto y objeto json con estado HTTP y mensaje del error. Si el error es una instancia de HttpError actualizará el codigo de estado y el objeto json tambien. Si el error viene de Prisma de igual manera actualizará el código de estado y el objeto json. Por último envía los datos actualizados tanto del estado como de json.   

  handle(error: Error, _req: Request, res: Response, _next: NextFunction) { // Método para manejar los errores
    let status = 500; 
    let json = { 
      status: '500 Internal Server Error', 
      message: error.message, 
    };

    if (error instanceof HttpError) { 
      debug('Error', error.message); 
      status = error.status; 
      json = { 
        status: `${error.status} ${error.statusMessage}`, 
        message: error.message, 
      };
    } else if (error instanceof PrismaClientKnownRequestError) { 
      debug('Prisma error', error.message); 
      status = 403; 
      json = { 
        status: '403 Forbidden', 
        message: error.message, 
      };
    }

    debug('Request received', error.message); 
    res.status(status); 
    res.json(json); 
  }
}
