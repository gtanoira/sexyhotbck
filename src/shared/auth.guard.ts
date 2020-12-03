import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

// Environment
import { SECRET_KEY } from 'src/environment/environment.settings';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private reflector: Reflector
  ) {}
  
  canActivate(context: ExecutionContext): boolean {

    // Get the Express request object
    const req = context.switchToHttp().getRequest();

    // Validate token and get user object
    const rtnAuth = this.validateToken(req);

    // Check if the user has the roles needed.
    const rolesRequired = this.reflector.get<string[]>('rolesRequired', context.getHandler());
    if (rolesRequired) {
      const user = req.user;
      // return matchRoles(rolesNeeded, user.roles);
    }
    
    return rtnAuth;
  }

  // Validate the token
  private validateToken(req: {[key: string]: any}): boolean {

    // Validate the existance of the authorization header
    if (!req.headers.authorization) {
      throw new ForbiddenException('GS-008(E): invalid token (no header).');
    }

    // Validate the token
    const auth = req.headers.authorization;
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new ForbiddenException('GS-008(E): invalid token (malformed token).');
    }
    // Decode token
    try {
      const token = auth.split(' ')[1];
      const decodedToken = jwt.verify(token, SECRET_KEY);
      // Validate expiration
      const expirationDate = moment.unix(decodedToken['exp']);
      if (expirationDate < moment()) {
        throw new ForbiddenException('GS-008(E): invalid token (expired).');
      }
      // Insert the user data into the Express request object
      req.user = decodedToken;

    } catch (error) {
      throw new ForbiddenException('GS-008(E): invalid token (malformed token).');
    }
    return true;
  }
}
