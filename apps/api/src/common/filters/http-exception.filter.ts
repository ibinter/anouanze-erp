import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  GENERIC_ERROR_KEY,
  resolveLocale,
  translateMessage,
  translateMessages,
} from '../i18n/messages';

/**
 * ============================================================================
 * TRADUCTION DES ERREURS À LA FRONTIÈRE HTTP
 * ----------------------------------------------------------------------------
 * Les services lèvent leurs exceptions avec des messages français codés en dur.
 * Plutôt que de modifier des dizaines de services, la traduction se fait ici,
 * au moment de sérialiser la réponse, en fonction de l'en-tête `Accept-Language`.
 *
 * Le format de réponse reste STRICTEMENT identique à celui de NestJS
 * (`{ statusCode, message, error }`) pour ne rien casser côté client — seul le
 * contenu de `message` est traduit.
 *
 * Les erreurs non-HTTP (bug, panne Prisma…) sont journalisées côté serveur et
 * renvoyées au client sous forme de message générique : jamais de stack, jamais
 * de message brut de base de données.
 * ============================================================================
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const locale = resolveLocale(request?.headers?.['accept-language']);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      // NestJS renvoie soit une chaîne, soit un objet { statusCode, message, error }.
      if (typeof body === 'string') {
        response.status(status).json({
          statusCode: status,
          message: translateMessage(body, locale),
        });
        return;
      }

      const objet = body as Record<string, unknown>;
      response.status(status).json({
        ...objet,
        // `message` peut être une chaîne ou un tableau (class-validator).
        message: translateMessages(objet.message, locale),
        ...(typeof objet.error === 'string'
          ? { error: objet.error } // libellé HTTP standard : laissé tel quel
          : {}),
      });
      return;
    }

    // Erreur non maîtrisée : on trace côté serveur, on reste muet côté client.
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    this.logger.error(
      `${request?.method ?? '?'} ${request?.url ?? '?'} — ${
        exception instanceof Error ? exception.message : String(exception)
      }`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message: translateMessage(GENERIC_ERROR_KEY, locale),
      error: 'Internal Server Error',
    });
  }
}
