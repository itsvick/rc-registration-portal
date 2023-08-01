import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router, RouterStateSnapshot } from '@angular/router';
import { AppConfig } from '../../app.config';
import { GeneralService } from 'src/app/services/general/general.service';
import { KeycloakLoginOptions } from 'keycloak-js';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { AuthConfigService } from '../auth-config.service';
import { DataService } from 'src/app/services/data/data-request.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-keycloaklogin',
  templateUrl: './keycloaklogin.component.html',
  styleUrls: ['./keycloaklogin.component.css']
})
export class KeycloakloginComponent implements OnInit {
  user: any;
  entity: string;
  profileUrl: string = '';
  entityArr: any;
  constructor(
    public readonly keycloakService: KeycloakService,
    public readonly router: Router,
    private readonly config: AppConfig,
    private readonly generalService: GeneralService,
    private readonly dataService: DataService,
    private readonly authConfigService: AuthConfigService
  ) { }

  async ngOnInit() {
    const isLoggedIn = await this.keycloakService.isLoggedIn();

    if (isLoggedIn) {
      const accountRes: any = await this.keycloakService.loadUserProfile();
      localStorage.setItem('userDetails', JSON.stringify(accountRes));
      if (accountRes?.attributes?.entity) {
        console.log(accountRes['attributes']?.entity?.[0]);
        this.entity = accountRes.attributes.entity?.[0];
        this.entityArr = accountRes.attributes.entity;
      }
      if (accountRes?.attributes?.locale?.length) {
        localStorage.setItem('setLanguage', accountRes['attributes'].locale[0]);
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

      this.getDetails().subscribe((res: any) => {
        console.log("res", res);
        this.router.navigate(['/dashboard']);
      })

      // const payload = {
      //   "filters": {
      //     "username": {
      //       "eq": this.user
      //     }
      //   }
      // }

      // const selectedEntity = this.entity ? this.entity : localStorage.getItem('entity')
      // this.generalService.postData(`/${selectedEntity}/search`, payload).subscribe((res: any) => {
      //   // if found redirect to dashboard
      //   // else redirect to the registration form /udise link form

      //   console.log("res", res);
      //   if (res.length && !this.entity) {
      //     this.router.navigate(['/udise-link']);
      //   } else {
      //     this.router.navigate(['/dashboard']);
      //   }
      // }, error => {
      //   console.error("Error while Searching Instructor", error);
      // });
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
    return this.dataService.get({ url: `${this.authConfigService.config.bulkIssuance}/bulk/v1/issuerdetail`, header: headerOptions }).pipe(map((res: any) => {
      console.log(res);
      localStorage.setItem('currentUser', JSON.stringify(res.result));
      return res;
    }));
  }

}
