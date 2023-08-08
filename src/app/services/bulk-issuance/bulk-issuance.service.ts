import { Injectable } from '@angular/core';
import { AuthConfigService } from 'src/app/authentication/auth-config.service';
import { DataService } from '../data/data-request.service';
import { retry, map } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import * as dayjs from 'dayjs';
import { AuthService } from '../auth/auth.service';

const MAX_EXPIRATION_DAYS= 365; // In days = a year

@Injectable({
  providedIn: 'root'
})
export class BulkIssuanceService {

  constructor(
    private readonly authConfigService: AuthConfigService,
    private readonly authService: AuthService,
    private readonly dataService: DataService
  ) { }


  /**
   * Retrieves the list of schemas from the server.
   * @return {Observable<any>} An observable that emits the list of schemas.
   */
  getSchemaList(): Observable<any> {
    const payload = {
      url: `${this.authConfigService.config.bulkIssuance}/bulk/v1/credential/schema/list`,
      data: {
        taglist: "ulpq2" //TODO: need to remove this hard coded tag //ulpq2 tag1
      }
    }
    return this.dataService.post(payload).pipe(retry(2), map((res: any) => res.result));
  }


  /**
   * Retrieves the schema fields for a given schema ID.
   *
   * @param {string} schemaId - The ID of the schema.
   * @return {Observable<any>} An observable that emits the schema fields.
   */
  getSchemaFields(schemaId: string): Observable<any> {
    const payload = {
      url: `${this.authConfigService.config.bulkIssuance}/bulk/v1/credential/schema/fields`,
      data: {
        schema_id: schemaId
      }
    }
    return this.dataService.post(payload).pipe(retry(2), map((res: any) => res.result));
  }


  issueBulkCredentials(schemaId: string, subjectList: any): Observable<any> {
    const currentUser = this.authService.currentUser;

    if (!currentUser){
      return throwError('UNABLE_TO_FIND_DID_LOGIN_AGAIN');
    }

    const currentDateTime = dayjs().toISOString();
    const payload = {
      url: `${this.authConfigService.config.bulkIssuance}/bulk/v1/credential/issue`,
      data: {
        schema_id: schemaId,
        issuerDetail: {
          did: currentUser.issuer_did // for issuer user use direct currentUser.did
        },
        vcData: {
          issuanceDate: currentDateTime,
          expirationDate: dayjs(currentDateTime).add(MAX_EXPIRATION_DAYS, 'day').toISOString()
        },
        credentialSubject: subjectList
      }
    }

    console.log("payload", payload);
    return this.dataService.post(payload).pipe(retry(2), map((res: any) => res.result));
  }
}
