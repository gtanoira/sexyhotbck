import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * GetUser obtain the user object from the Express request
 * The user object is of the form:
 * { 
 *    id: 5,
 *    userId: vlaquier,
 *    roles: editor
 * }
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