import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// Environment
import { AVAILABLE_LANGUAGES } from '../environment/environment.settings';
/**
 * GetLanguage obtain the language the client expect the messages to be sent back.
 * The language is obtain from the Express request through the 'Accept-Language' header
 * If there is a problem, the default language is return (default: en)
 * 
 * No @params
 *
 */
export const GetLanguage = createParamDecorator(

  (data: unknown, ctx: ExecutionContext) => {

    const request = ctx.switchToHttp().getRequest();
    let language = request.headers['accept-language'];

    // Check for available languages
    if (!language || !AVAILABLE_LANGUAGES.includes(language)) {
      language = 'en';
    }

    return language;
  },
);