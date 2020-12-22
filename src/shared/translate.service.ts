import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
// Models
import { i18n } from 'src/models/i18n.entity';

@Injectable()
export class TranslateService {

  private connection = getConnection('SEXYHOT')

  public async key(key: string, language: string): Promise<string> {
    console.log('*** key:', key, language);
    
    return await this.connection.getRepository(i18n).findOne({key: key, language: language})
      .then(data => { return data.text; })
      .catch(() => { return key; });
  }
}
