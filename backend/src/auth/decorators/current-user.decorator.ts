import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!data) {
      return user;
    }
    
    // Map 'sub' to 'userId' for compatibility
    if (data === 'sub') {
      return user?.userId;
    }
    
    return user?.[data];
  },
);
