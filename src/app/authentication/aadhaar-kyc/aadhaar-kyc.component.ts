import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-aadhaar-kyc',
  templateUrl: './aadhaar-kyc.component.html',
  styleUrls: ['./aadhaar-kyc.component.scss']
})
export class AadhaarKycComponent implements OnInit {
  isGetOTPClicked = false
  isAadhaarVerified: boolean;

  aadhaarFormControl = new FormControl('', [Validators.required]);
  otpFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{4}$')]);

  successModalRef: NgbModalRef;
  @ViewChild("successModal") successModal: ElementRef;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastMessage: ToastMessageService,
    private readonly utilService: UtilService,
    private readonly modalService: NgbModal
  ) {
    if (this.authService!.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void { }

  getOTP() {
    this.isGetOTPClicked = true;
  }

  submitOTP() {
    const payload = {
      aadhaar_id: this.aadhaarFormControl.value.toString(),
      // aadhaar_name: this.authService.currentUser.name,
      // aadhaar_gender: this.authService.currentUser.gender,
      // aadhaar_dob: this.authService.currentUser.dob
    }
    this.authService.aadhaarKYC(payload).subscribe((res: any) => {
      this.isAadhaarVerified = true;
      // this.toastMessage.success('', this.utilService.translateString('SUCCESSFULLY_REGISTERED'));
      this.successModalRef = this.modalService.open(this.successModal, {
        animation: true,
        centered: true,
        size: 'sm'
        // windowClass: 'box-shadow-bottom'
      });
      this.successModalRef.dismissed.subscribe(() => {
        if (!this.authService.currentUser?.school_id || !this.authService.currentUser?.school_name) {
          this.router.navigate(['/verify-udise']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      });

    }, (error) => {
      this.toastMessage.success('', this.utilService.translateString('UNABLE_TO_VERIFY_YOUR_AADHAAR'));
      this.isAadhaarVerified = false;
    });
  }
}
