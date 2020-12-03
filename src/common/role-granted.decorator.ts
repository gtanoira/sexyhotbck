import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * RoleGranted check if the user has the correct role to 
 * 
 * @param('data'): property to return from the user object instead of the hole object
 *
 */
export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {

    const request = ctx.switchToHttp().getRequest();
    // Get the user object that was injected by the token
    const user = request.user;

    return data ? user[data] : user;
  },
);