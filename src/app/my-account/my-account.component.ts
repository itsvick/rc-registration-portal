import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AadhaarKycComponent } from '../authentication/aadhaar-kyc/aadhaar-kyc.component';
import { UdiseVerificationComponent } from '../udise-verification/udise-verification.component';
import { DataService } from '../services/data/data-request.service';
import { AuthConfigService } from '../authentication/auth-config.service';
import { HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  accountDetails: any;
  isAadhaarKYCCompleted = false;
  isUDISEVerified = false;


  successModalRef: NgbModalRef;
  @ViewChild("successModal") successModal: ElementRef;

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    private readonly dataService: DataService,
    private readonly authConfigService: AuthConfigService
  ) { }

  ngOnInit(): void {
    this.accountDetails = this.authService.currentUser;

    if (this.accountDetails?.kyc_aadhaar_token) {
      this.isAadhaarKYCCompleted = true;
    }

    if (this.accountDetails?.school_id) {
      this.isUDISEVerified = true;
    }
  }

  completeKYC() {
    const aadhaarModalRef = this.modalService.open(AadhaarKycComponent, {
      windowClass: 'box-shadow-bottom',
      centered: true,
      size: 'md'
    });
    aadhaarModalRef.closed.subscribe(() => {
      this.getDetails();
      this.showSuccessModal();
    });
  }

  verifyUDISE() {
    const udiseModalRef = this.modalService.open(UdiseVerificationComponent, {
      windowClass: 'box-shadow-bottom',
      centered: true,
      size: 'md'
    });
    udiseModalRef.closed.subscribe(() => {
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
    this.dataService.get({ url: `${this.authConfigService.config.bulkIssuance}/bulk/v1/instructor/getdetail`, header: headerOptions }).pipe(map((res: any) => {
      localStorage.setItem('currentUser', JSON.stringify(res.result));
      this.accountDetails = res.result;
      return res;
    })).subscribe();
  }
}
