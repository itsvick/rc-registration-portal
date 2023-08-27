import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { KeycloakService } from 'keycloak-angular';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from '../services/util/util.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  issuerId: string;

  signInModalRef: NgbModalRef;
  @ViewChild("signInModal") signInModal: ElementRef;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly keycloakService: KeycloakService,
    private readonly modalService: NgbModal,
    private readonly toastService: ToastrService,
    private readonly utilService: UtilService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((queryParams: any) => {
      if (!queryParams.issuerId) {
        this.toastService.error('', this.utilService.translateString('PLEASE_SELECT_DEPARTMENT_FIRST'));
        this.router.navigate(['']);
        return;
      }
      this.issuerId = queryParams.issuerId;
    });

    // try {
    //   // const isLoggedIn = await this.keycloakService.isLoggedIn();
    //   // if (this.keycloakService.isLoggedIn() && !this.keycloakService.isTokenExpired()) {
    //   //   this.router.navigate(['/dashboard']);
    //   // } else {
    //   //   localStorage.clear();
    //   //   this.keycloakService.clearToken();
    //   // }
    // } catch (error) {
    //   console.log("error==>", error);
    //   this.keycloakService.clearToken();
    // }
  }

  /**
  * Sets the specified string value in local storage as the 'entity' key.
  * @param {string} entity - the value to set as the 'entity' key in local storage.
  */
  setEntity(entity: string) {
    localStorage.setItem('entity', entity);
  }

  registerUser() {
    this.router.navigate(['/form/instructor-signup'], {
      queryParams: {
        issuer_did: this.issuerId
      }
    });
  }

  openSignInModal() {
    // this.signInModalRef = this.modalService.open(this.signInModal, {
    //   animation: true,
    //   centered: true,
    //   windowClass: 'box-shadow-bottom'
    // });

    this.router.navigate(['/login']);
  }
  
  closeModal() {
    this.signInModalRef.close();
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
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
