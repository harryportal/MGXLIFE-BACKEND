import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from './error'; 
import { multerUpload } from '../utils/fileStorage/multer';
import logger from '../utils/logging/winston';

export default class RequestValidator {
  static upload = multerUpload.single("image") // Middleware to handle `multipart/form-data` and attach parsed data to `req.body`

  static validate = <T extends object>(classInstance: ClassConstructor<T>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      RequestValidator.upload(req, res, async (err: any) => {
        if (err) {
          // Handle any errors during file upload
          next(err);
        } else {
          try {
            const objectClass = plainToClass(classInstance, req.body);
            const errors: ValidationError[] = await validate(objectClass);
            if (errors.length > 0) {
              const rawErrors: string[] = [];
              for (const error of errors) {
                rawErrors.push(...Object.values(error.constraints ?? []));
              }
              logger.error(rawErrors);
              next(new BadRequestError('Input validation failed!', rawErrors));
            } else {
              next();
            }
          } catch (err) {
            // Handle any unexpected errors
            next(err);
          }
        }
      });
    };
  };
}
