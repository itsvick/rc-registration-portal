import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router, RouterStateSnapshot } from '@angular/router';
import { AppConfig } from '../../app.config';
import { GeneralService } from 'src/app/services/general/general.service';
import { KeycloakLoginOptions } from 'keycloak-js';

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
    public keycloakService: KeycloakService,
    public router: Router, private config: AppConfig,
    private readonly generalService: GeneralService
  ) { }

  async ngOnInit() {
    const isLoggedIn = await this.keycloakService.isLoggedIn();

    if (isLoggedIn) {
      this.keycloakService.loadUserProfile().then((res: any) => {
        localStorage.setItem('userDetails', JSON.stringify(res));
        if (res?.attributes?.entity) {
          console.log(res['attributes']?.entity?.[0]);
          this.entity = res.attributes.entity?.[0];
          this.entityArr = res.attributes.entity;
        }
        if (res?.attributes?.locale?.length) {
          localStorage.setItem('setLanguage', res['attributes'].locale[0]);
        }
      });
      this.user = this.keycloakService.getUsername();

      this.keycloakService.getToken().then((token) => {
        localStorage.setItem('token', token);
        if (this.entity) {
          localStorage.setItem('entity', this.entity);
        }

        if (this.user) {
          localStorage.setItem('loggedInUser', this.user);
        }
        console.log('---------', this.config.getEnv('appType'));

        const payload = {
          "filters": {
            "username": {
              "eq": this.user
            }
          }
        }

        const selectedEntity = this.entity ? this.entity : localStorage.getItem('entity')
        this.generalService.postData(`/${selectedEntity}/search`, payload).subscribe((res: any) => {
          // if found redirect to dashboard
          // else redirect to the registration form /udise link form

          console.log("res", res);
          if (res.length && !this.entity) {
            this.router.navigate(['/udise-link']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, error => {
          console.error("Error while Searching Instructor", error);
        });
      });
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

}
