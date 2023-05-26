import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';
import { AppConfig } from '../../app.config';
import { GeneralService } from 'src/app/services/general/general.service';

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

  ngOnInit(): void {
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

      // if (this.config.getEnv('appType') && this.config.getEnv('appType') === 'digital_wallet') {
      //   this.profileUrl = this.entity + '/documents'
      // } if (this.entity === 'issue' || this.entity === 'Issuer') {
      //   this.profileUrl = '/dashboard';
      // } else {
      // if (this.entityArr.length == 1) {
      //     if (this.entity == 'Student' || this.entity =='Teacher' || this.entity == 'Institute' || this.entity == 'board-cbse') {
      //       this.profileUrl = '/profile/' + this.entity;
      //     } else {
      //       this.profileUrl = '/list/verifiable-credential';

      //     }
      //   }else{

      //     let isSetEntity = false;

      //     for(let i =0; i < this.entityArr.length; i++)
      //     {
      //       if (this.entityArr[i] == 'Student' || this.entityArr[i] =='Teacher' || this.entityArr[i] == 'Institute' || this.entityArr[i] == 'board-cbse') {
      //         this.entity = this.entityArr[i];
      //         this.profileUrl = '/profile/' + this.entity;
      //         isSetEntity = true;
      //       } 
             
      //     }

      //     if(!isSetEntity){
      //       this.profileUrl = '/list/verifiable-credential';
      //     }
      //   }
      // }
      // this.router.navigate([this.profileUrl]);

    });
  }


}
