import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { KeycloakService } from 'keycloak-angular';
import { AuthConfigService } from '../authentication/auth-config.service';

export interface IDepartment {
  id: string;
  name: string;
  img: string;
  class: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

  departments: IDepartment[] = [
    {
      id: '',
      name: '',
      img: 'assets/images/lp-7.png',
      class: 'img1'
    },
    {
      id: 'did:ulp:7fc21e89-0496-473a-8b70-112547979ea4',
      name: '',
      img: 'assets/images/lp-6.png',
      class: 'img1'
    },
    {
      id: '',
      name: '',
      img: 'assets/images/lp-5.png',
      class: 'img2'
    },
    {
      id: '',
      name: '',
      img: 'assets/images/lp-4.png',
      class: 'img1'
    },
    {
      id: '',
      name: '',
      img: 'assets/images/lp-3.png',
      class: 'img1'
    },
    {
      id: '',
      name: '',
      img: 'assets/images/lp-2.png',
      class: 'img3'
    },
    {
      id: '',
      name: '',
      img: 'assets/images/lp-1.png',
      class: 'img1'
    }
  ];

  title: string;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly keycloakService: KeycloakService,
    private readonly authConfigService: AuthConfigService
  ) { }

  async ngOnInit() {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    if (isLoggedIn && !this.keycloakService.isTokenExpired()) {
      this.router.navigate(['/dashboard']);
    } else {
      localStorage.clear();
      this.keycloakService.clearToken();
    }

    this.title = this.authConfigService.config.title;
  }

  ngAfterViewInit(): void {
    this.raiseImpressionEvent();
  }

  navigateToOnboarding(issuerId: string) {
    if (!issuerId) {
      return;
    }
    localStorage.setItem('issuerId', issuerId);
    this.raiseInteractEvent('department-select-btn');
    this.router.navigate(['/onboarding'], { queryParams: { issuerId: issuerId } });
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
    console.log("raiseInteractEvent")
    const telemetryInteract: IInteractEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        id,
        type,
        subtype,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
      }
    };
    this.telemetryService.interact(telemetryInteract);
  }

  raiseImpressionEvent() {
    const telemetryImpression: IImpressionEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        type: this.activatedRoute.snapshot?.data?.telemetry?.type,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
        uri: this.router.url,
        subtype: this.activatedRoute.snapshot?.data?.telemetry?.subtype,
      }
    };
    this.telemetryService.impression(telemetryImpression);
  }
}
