import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OrganisationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request.user?.organisationId ||
      request.headers['x-organisation-id']
    );
  },
);
