import { Request, Response, NextFunction } from 'express';

type Controller = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Wraps async controller so errors are passed to the global error middleware.
 * Use it in the router: router.get('/path', ctrlWrapper(controller.someMethod));
 */
export function ctrlWrapper(ctrl: Controller) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await ctrl(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
