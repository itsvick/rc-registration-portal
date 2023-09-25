import { Injectable } from '@angular/core';
import { AuthConfigService } from '../authentication/auth-config.service';
import { AuthService } from './auth/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataService } from './data/data-request.service';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {

  bffUrl: string;
  constructor(
    private readonly dataService: DataService,
    private readonly authService: AuthService,
    private readonly authConfigService: AuthConfigService
  ) {
    this.bffUrl = this.authConfigService.config.bffUrl;
  }

  searchClaims(): Observable<any> {
    const payload = {
      url: `${this.bffUrl}/v1/claim/search`,
      data: {
        type: "teacher"
      }
    }
    return this.dataService.post(payload).pipe(map((res: any) => res.result));
  }

  attestClaim(data): Observable<any> {
    const payload = {
      url: `${this.bffUrl}/v1/claim/attest`,
      data
    }
    return this.dataService.put(payload);
  }

  getCorrectionRequests(): Observable<any> {
    const payload = {
      url: `${this.bffUrl}/v1/claim/correction`,
    }
    return this.dataService.post(payload).pipe((res: any) => res.result);
  }

  reIssueCredential(credentialId: string) {
    const payload = {
      url: `${this.bffUrl}/v1/credentials/reissue/${credentialId}`
    }
    return this.dataService.put(payload).pipe((res: any) => res.result);
  }
}
