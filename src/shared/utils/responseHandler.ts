export class ResponseHandler {
    static success(res: any, data: any, message = 'Operation successful', statusCode = 200) {
      return res.status(statusCode).json({
        success: true,
        message,
        data,
      });
    }
  
    static error(res: any, error: any, message = 'An error occurred', statusCode = 500) {
      return res.status(statusCode).json({
        success: false,
        message,
        error: error instanceof Error ? error.message : error,
      });
    }
  
    static badRequest(res: any, message = 'Bad request') {
      return this.error(res, null, message, 400);
    }
  
    static notFound(res: any, message = 'Not found') {
      return this.error(res, null, message, 404);
    }
  }