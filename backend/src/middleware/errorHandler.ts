import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/index.js';

export const errorHandler = (
  error: Error | CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  // Default error values
  let status = 500;
  let message = 'Internal server error';

  // Handle custom errors
  if (error instanceof CustomError) {
    status = error.status;
    message = error.message;
  } 
  // Handle Mongoose validation errors
  else if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  }
  // Handle Mongoose duplicate key errors
  else if (error.name === 'MongoError' && (error as any).code === 11000) {
    status = 409;
    message = 'Resource already exists';
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }
  // Handle development vs production error details
  else if (process.env.NODE_ENV === 'development') {
    message = error.message;
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};
