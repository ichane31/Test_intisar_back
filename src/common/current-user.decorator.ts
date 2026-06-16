import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type JwtUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtUser }>();
    return request.user;
  },
);
