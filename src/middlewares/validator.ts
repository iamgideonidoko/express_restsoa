import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { NextFunction, Request, Response } from 'express';
import { ValidateError } from 'tsoa';

/**! Usage
import { Middlewares } from 'tsoa';
class RequestClass {
  @Length(2, 5)
  text!: string;
}
@Middlewares([validateBody(RequestClass)])
public endpoint(@Body() body: RequestClass) {}
*/
export function validateBody<T extends object>(targetClass: ClassConstructor<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const instance = plainToInstance(targetClass, req.body);
    const errors = validateSync(instance, {
      forbidUnknownValues: true,
      validationError: {
        target: false,
      },
    });
    const fieldsErrors: Record<string, { message: string; value: string }> = {};

    if (errors.length > 0) {
      errors.forEach((error) => {
        if (error.constraints) {
          fieldsErrors[error.property] = {
            message: Object.values(error.constraints).join(', '),
            value: error.value as string,
          };
        }
        if (error.children) {
          error.children.forEach((errorNested) => {
            if (errorNested.constraints) {
              fieldsErrors[errorNested.property] = {
                message: Object.values(errorNested.constraints).join(', '),
                value: errorNested.value as string,
              };
            }
          });
        }
      });
      next(new ValidateError(fieldsErrors, 'Validation failed'));
      return;
    }
    next();
  };
}
