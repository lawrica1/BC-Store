import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const rawMessage = exception instanceof HttpException ? exception.getResponse() : "Internal server error";
    const message = typeof rawMessage === "string" ? rawMessage : (rawMessage as { message?: string | string[] }).message ?? "Request failed";

    response.status(statusCode).json({
      statusCode,
      message: Array.isArray(message) ? message.join(", ") : message,
      timestamp: new Date().toISOString()
    });
  }
}
