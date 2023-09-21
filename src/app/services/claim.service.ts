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
      url: `${this.bffUrl}/v1/claim/search`
    }
    return this.dataService.get(payload).pipe(map((res: any) => res.result));
  }

  attestClaim(data): Observable<any> {
    const payload = {
      url: `${this.bffUrl}/v1/claim/attest`,
      data
    }
    return this.dataService.put(payload).pipe(map((res: any) => res.result));
  }
}
