import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AadhaarKycComponent } from '../authentication/aadhaar-kyc/aadhaar-kyc.component';
import { UdiseVerificationComponent } from '../udise-verification/udise-verification.component';
import { DataService } from '../services/data/data-request.service';
import { AuthConfigService } from '../authentication/auth-config.service';
import { HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { UtilService } from '../services/util/util.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit, AfterViewInit {

  accountDetails: any;
  isAadhaarKYCCompleted = false;
  isUDISEVerified = false;
  modalMessage: string;

  successModalRef: NgbModalRef;
  @ViewChild("successModal") successModal: ElementRef;

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    private readonly dataService: DataService,
    private readonly authConfigService: AuthConfigService,
    private readonly util: UtilService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
  ) { }

  ngOnInit(): void {
    this.getAccountDetails();
  }

  completeKYC() {
    const aadhaarModalRef = this.modalService.open(AadhaarKycComponent, {
      windowClass: 'box-shadow-bottom',
      centered: true,
      size: 'md'
    });
    aadhaarModalRef.closed.subscribe(() => {
      this.modalMessage = this.util.translateString('E_KYC_DONE_SUCCESSFULLY');
      this.getDetails();
      this.showSuccessModal();
    });
  }

  verifyUDISE() {
    this.raiseInteractEvent('verify-udise-btn');
    const udiseModalRef = this.modalService.open(UdiseVerificationComponent, {
      windowClass: 'box-shadow-bottom',
      centered: true,
      size: 'md'
    });
    udiseModalRef.dismissed.subscribe(() => {
      this.raiseInteractEvent('udise-verification-dismiss-outside-click');
    });
    udiseModalRef.closed.subscribe(() => {
      this.modalMessage = this.util.translateString('UDISE_VERIFICATION_SUCCESS');
      this.getDetails();
      this.showSuccessModal();
    });
  }

  showSuccessModal() {
    this.successModalRef = this.modalService.open(this.successModal, {
      animation: true,
      centered: true,
      size: 'sm'
    });
  }

  getDetails() {
    let headerOptions = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });

    let apiUrl;
    if (localStorage.getItem('isDigilockerUser') === 'true') {
      apiUrl = `${this.authConfigService.config.bulkIssuance}/bulk/v1/instructor/digi/getdetail`;
    } else {
      apiUrl = `${this.authConfigService.config.bulkIssuance}/bulk/v1/instructor/getdetail`;
    }

    this.dataService.get({ url: apiUrl, header: headerOptions }).pipe(map((res: any) => {
      localStorage.setItem('currentUser', JSON.stringify(res.result));
      return res;
    })).subscribe(() => {
      this.getAccountDetails();
      if (this.authService.isKYCCompleted()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  getAccountDetails() {
    this.accountDetails = this.authService.currentUser;
    this.maskAadhaar();

    if (this.accountDetails?.kyc_aadhaar_token) {
      this.isAadhaarKYCCompleted = true;
    }

    if (this.accountDetails?.school_id) {
      this.isUDISEVerified = true;
    }

    if (this.authService.isKYCCompleted()) {
      this.util.kycCompleted.next(true);
    }
  }

  maskAadhaar() {
    if (this.accountDetails.kyc_aadhaar_token) {
      this.accountDetails.kyc_aadhaar_token = "**** **** " + this.accountDetails.kyc_aadhaar_token.slice(-4);
    }
  }

  ngAfterViewInit(): void {
    this.raiseImpressionEvent();
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
