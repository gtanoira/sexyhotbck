import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

// Environment
import { AVAILABLE_LANGUAGES, SECRET_KEY } from 'src/environment/environment.settings';
// User Roles (enum)
import { UserRoles } from 'src/user/user.roles';
// Services
import { TranslateService } from './translate.service';

/**
 * This GUARD runs some checks before granting access to a route. 
 * If any of these checks fail, the route is not executed.
 * The checks are:
 * 1) Token: must be valid and not expired
 * 2) User object: after the token, the user object is created, extracted from the token payload.
 *    The user object is inserted in the Express request.
 *    user Object: {
 *                   id: 3,
 *                   userId: 'vgrey',
 *                   roles: 'writer',
 *                   iat: 1608666830,
 *                   exp: 1608753230
 *                 }
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
    private readonly reflector: Reflector,
    private translate: TranslateService
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {

    // Get the Express request object
    const req = context.switchToHttp().getRequest();

    // Get the language
    let language = req.headers['accept-language'];
    if (!language || !AVAILABLE_LANGUAGES.includes(language)) {
      language = 'en';
    }

    // Validate token and get user object
    const ynToken = await this.validateToken(req, language);
    
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
      // Log un-granted user
      console.log('*** NOT granted:', moment().utc().format('y, MMM Do, H:mm:ss UTC'));
      console.log(`User: ${req.user.userId} - Roles: ${req.user.roles} - Url: ${req.url}`);
      throw new ForbiddenException('GS-009(E): insufficient privileges.');
    }

    // Log granted user
    console.log(`*** Granted: ${moment().utc().format('y, MMM Do, H:mm:ss UTC')} - User: ${req.user.userId} - Roles: ${req.user.roles} - Url: ${req.method} ${req.url}`);
   
    return true;
  }

  // Validate the token
  private async validateToken(req: {[key: string]: any}, language: string): Promise<boolean> {

    // Validate the existance of the authorization header
    if (!req.headers.authorization) {
      const msg = await this.translate.key('GS-008', language);
      throw new ForbiddenException(`${msg} (no header).`);
    }

    // Validate the token
    const auth = req.headers.authorization;
    if (auth.split(' ')[0] !== 'Bearer') {
      const msg = await this.translate.key('GS-008', language);
      throw new ForbiddenException(`${msg} (malformed token).`);
    }
    // Decode token
    try {
      const token = auth.split(' ')[1];
      const decodedToken = jwt.verify(token, SECRET_KEY);
      // Validate expiration
      const expirationDate = moment.unix(decodedToken['exp']);
      if (expirationDate < moment()) {
        const msg = await this.translate.key('GS-008', language);
        throw new ForbiddenException(`${msg} (expired).`);
      }
      // Insert the user data into the Express request object
      req.user = decodedToken;

    } catch (error) {
      const msg = await this.translate.key('GS-008', language);
      throw new ForbiddenException(`${msg} (malformed token).`);
    }
    return true;
  }
}
