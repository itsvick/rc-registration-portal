import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-aadhaar-kyc',
  templateUrl: './aadhaar-kyc.component.html',
  styleUrls: ['./aadhaar-kyc.component.scss']
})
export class AadhaarKycComponent implements OnInit {
  showForm = false;
  isGetOTPClicked = false
  showKYCStatus = false;
  isAadhaarVerified: boolean;
  state: any;
  headerName = 'plain';

  aadhaarFormControl = new FormControl('', [Validators.required]);
  otpFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{4}$')]);

  statusModalRef: NgbModalRef;
  @ViewChild("statusModal") statusModal: ElementRef;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly modalService: NgbModal
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.state = { ...navigation.extras.state };

    if (!Object.keys(this.state).length) {
      if (this.authService.isLoggedIn) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  ngOnInit(): void {
  }

  getOTP() {
    this.isGetOTPClicked = true;
  }

  closeModal() {
    this.statusModalRef.close();
  }

  submitOTP() {
    const payload = {
      "aadhaar_id": this.aadhaarFormControl.value.toString(),
      "aadhaar_name": this.state.name,
      "aadhaar_gender": this.state.gender,
      "aadhaar_dob": this.state.dob
    }
    this.authService.aadhaarKYC(payload).subscribe((res: any) => {
      this.showKYCStatus = true;
      this.isAadhaarVerified = true;
      this.statusModalRef = this.modalService.open(this.statusModal);
    }, (error) => {
      this.showKYCStatus = true;
      this.isAadhaarVerified = false;
    });
  }

  startKYC() {
    this.showForm = true;
  }

  gotoDashboard() {
    this.statusModalRef.dismiss();
    this.router.navigate(['/dashboard']);
  }

  onRetry() {
    this.showKYCStatus = false;
    this.statusModalRef.dismiss();
  }
}
