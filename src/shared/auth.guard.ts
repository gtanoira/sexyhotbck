import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

// Environment
import { SECRET_KEY } from 'src/environment/environment.settings';
// User Roles (enum)
import { UserRoles } from 'src/user/user.roles';

/**
 * This GUARD runs some checks before granting access to a route. 
 * If any of these checks fail, the route is not executed.
 * The checks are:
 * 1) Token: must be valid and not expired
 * 2) User object: after the token, the user object is created, so this check validates this.
 *    The user object must exist in the Express request
 * 3) Role: the user must have at least one of the roles required to access the route.
 * 
 * Roles required: provided by the decorator @RolesRequired()
 * The user must have ONE (1) of these roles
 * @param rolesRequired: string 
 * 
 * Token: provided by the req.headers.authorization
 * @param req.headers.authorization
 * 
 * @return boolean 
 */

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) {}
  
  canActivate(context: ExecutionContext): boolean {

    // Get the Express request object
    const req = context.switchToHttp().getRequest();

    // Validate token and get user object
    const ynToken = this.validateToken(req);
    
        // Check if the user has the roles needed.
    let ynRoles = true;
    const rolesRequired = this.reflector?.get<string[]>('rolesRequired', context.getHandler());
    if (rolesRequired) {
      const usrRoles = req.user.roles;
      // Validate role
      if (usrRoles) {
        // Is ADMIN?
        if (usrRoles.indexOf(UserRoles.ADMIN) >= 0) {
          ynRoles = true;
        } else {
          const existingRole = usrRoles.split(',').find(role => rolesRequired.indexOf(role) >= 0);
          ynRoles = existingRole ? true : false;      
        }
      } else {
        ynRoles = false;
      }
    }

    if (!ynToken || !req.user || !ynRoles) {
      throw new ForbiddenException('GS-009(E): insufficient privileges.');
    }
    
    return true;
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
