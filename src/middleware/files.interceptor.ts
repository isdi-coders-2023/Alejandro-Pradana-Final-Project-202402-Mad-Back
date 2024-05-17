import { type NextFunction, type Request, type Response } from 'express';
import { v2 } from 'cloudinary';
import createDebug from 'debug';
import multer from 'multer';
import { HttpError } from './errors.middleware.js';
const debug = createDebug('W9E:files:interceptor');

export class FilesInterceptor {
  constructor() {
    debug('Instantiated files interceptor');
  }

  singleFile(fieldName = 'avatar') {
    console.log("singlefile");
    debug('Creating single file middleware');
    const storage = multer.diskStorage({
      destination: 'uploads/',
      filename(_req, file, callback) {
        callback(null, Date.now() + '_' + file.originalname);
      },
    });

    const upload = multer({ storage });
    const middleware = upload.single(fieldName);

    return (req: Request, res: Response, next: NextFunction) => {
      debug('Uploading single file');
      const previosBody = req.body as Record<string, unknown>;
      middleware(req, res, next);
      req.body = { ...previosBody, ...req.body } as unknown;
    };
  }

  async cloudinaryUpload(req: Request, res: Response, next: NextFunction) {
    debug('Uploading file to cloudinary');
    console.log("upload");
    const options = {
      folder: 'profile_pics',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      use_filename: true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      unique_filename: false,
      overwrite: true,
    };

    if (!req.file) {
      
      req.body.avatar = 'https://res.cloudinary.com/djzn9f9kc/image/upload/v1715610754/avatar0_puca1b.jpg'

      next();
      return;
    }

    const finalPath = req.file.destination + '/' + req.file.filename;

    try {
      const result = await v2.uploader.upload(finalPath, options);
      req.body.avatar = result.secure_url;
      next();
    } catch (error) {
      next(
        new HttpError(500, 'Internal server error', (error as Error).message)
      );
    }
  }
}
