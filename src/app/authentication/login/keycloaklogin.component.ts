import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { NavigationExtras, Router, RouterStateSnapshot } from '@angular/router';
import { AppConfig } from '../../app.config';
import { GeneralService } from 'src/app/services/general/general.service';
import { KeycloakLoginOptions } from 'keycloak-js';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { AuthConfigService } from '../auth-config.service';
import { DataService } from 'src/app/services/data/data-request.service';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';

dayjs.extend(customParseFormat);
@Component({
  selector: 'app-keycloaklogin',
  templateUrl: './keycloaklogin.component.html',
  styleUrls: ['./keycloaklogin.component.css']
})
export class KeycloakloginComponent implements OnInit {
  user: any;
  entity: string;
  entityArr: any;
  isDigilockerUser = false;
  digiLockerUser: any;

  constructor(
    public readonly keycloakService: KeycloakService,
    public readonly router: Router,
    private readonly config: AppConfig,
    private readonly generalService: GeneralService,
    private readonly dataService: DataService,
    private readonly authConfigService: AuthConfigService,
    private readonly toastMessage: ToastMessageService
  ) { }

  async ngOnInit() {
    const isLoggedIn = await this.keycloakService.isLoggedIn();

    if (isLoggedIn) {
      const accountRes: any = await this.keycloakService.loadUserProfile();
      localStorage.setItem('userDetails', JSON.stringify(accountRes));

      if (accountRes?.attributes?.entity?.[0]) {
        console.log(accountRes['attributes']?.entity?.[0]);
        this.entity = accountRes.attributes.entity?.[0];
        this.entityArr = accountRes.attributes.entity;
      }

      if (accountRes?.attributes?.locale?.length) {
        localStorage.setItem('setLanguage', accountRes['attributes'].locale[0]);
      }

      if (accountRes?.attributes?.name?.length) {
        this.isDigilockerUser = true;
        localStorage.setItem('isDigilockerUser', 'true');
        localStorage.setItem('currentUser', JSON.stringify({ name: accountRes.attributes.name[0] }));
        this.digiLockerUser = {
          name: accountRes.attributes.name[0],
          dob: accountRes.attributes.dob[0],
          gender: accountRes.attributes.gender[0]
        }

        if (!accountRes?.attributes?.phone_number) {
          this.toastMessage.error('', this.generalService.translateString('UNABLE_TO_FETCH_PHONE_NUMBER_FROM_MERI_PEHCHAAN'));
          this.router.navigate(['/logout']);
          return;
        }
      }

      this.user = this.keycloakService.getUsername();
      const token = await this.keycloakService.getToken();
      localStorage.setItem('token', token);
      if (this.entity) {
        localStorage.setItem('entity', this.entity);
      }

      if (this.user) {
        localStorage.setItem('loggedInUser', this.user);
      }
      console.log('---------', this.config.getEnv('appType'));

      if (this.isDigilockerUser) {
        const payload = {
          url: `${this.authConfigService.config.bffUrl}/v1/instructor/digi/getdetail`,
          data: {...this.digiLockerUser, dob: dayjs(this.digiLockerUser.dob, 'DD/MM/YYYY').format('DD/MM/YYYY')},
          header: new HttpHeaders({
            Authorization: 'Bearer ' + localStorage.getItem('token')
          })
        }
        this.dataService.post(payload).subscribe((res: any) => {
          console.log(res);
          if (res.result) {
            localStorage.setItem('currentUser', JSON.stringify(res.result));
          }
          this.router.navigate(['/dashboard']);
        }, error => {
          console.log(error);

          if (error?.error?.success === false) {
            let dob;
            if (accountRes?.attributes?.dob?.[0]) {
              dob = dayjs(accountRes.attributes.dob[0], 'DD/MM/YYYY').format('DD/MM/YYYY');
            }
            this.router.navigate(['/form/instructor-signup'], {
              queryParams: {
                name: accountRes.attributes.name[0],
                dob,
                gender: accountRes.attributes.gender[0],
                username: accountRes.attributes.phone_number[0]
              }
            })
          } else {
            this.router.navigate(['/logout']);
          }
        });
      } else {
        this.getDetails().subscribe((res: any) => {
          const navigationExtras: NavigationExtras = {
            state: {
              name: res.result?.name,
              dob: res.result?.dob,
              gender: res.result?.gender,
            }
          }

          if (!res?.result?.kyc_aadhaar_token) { // Aadhar KYC is pending
            this.router.navigate(['/aadhaar-kyc'], navigationExtras);
          } else if (res?.result?.aadhaar_token && res?.result?.kyc_aadhaar_token !== res?.result?.aadhaar_token) { // Institute given Aadhaar and Aadhaar KYC not matched
            navigationExtras.state.aadhaarMatchError = true;
            this.router.navigate(['/aadhaar-kyc'], navigationExtras); // re-kyc
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, (err) => {
          this.router.navigate(['/logout']);
          console.log(err);
        });
      }
    } else {
      const snapshot: RouterStateSnapshot = this.router.routerState.snapshot;
      this.keycloakService
        .getKeycloakInstance()
        .login(<KeycloakLoginOptions>{
          locale: localStorage.getItem('setLanguage'),
          redirectUri: window.location.origin + snapshot.url
        })
        .then((res) => {
          console.log({ res });
        });
    }
  }


  getDetails(): Observable<any> {
    let headerOptions = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    // bulk/v1/issuerdetail
    return this.dataService.get({ url: `${this.authConfigService.config.bffUrl}/v1/instructor/getdetail`, header: headerOptions }).pipe(map((res: any) => {
      console.log(res);
      localStorage.setItem('currentUser', JSON.stringify(res.result));
      return res;
    }));
  }

}
