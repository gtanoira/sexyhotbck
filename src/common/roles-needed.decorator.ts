import { SetMetadata } from '@nestjs/common';

export const RolesNeeded = (...roles: string[]) => SetMetadata('rolesRequired', roles);