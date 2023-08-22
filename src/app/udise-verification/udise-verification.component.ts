import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';

@Component({
  selector: 'app-udise-verification',
  templateUrl: './udise-verification.component.html',
  styleUrls: ['./udise-verification.component.scss']
})
export class UdiseVerificationComponent implements OnInit {

  isGetOTPClicked = false;
  isUDISEVerified = false;
  udiseDetails: any;
  isLoading = false;

  udiseFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{11}$')]);
  mobileFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]);
  otpFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{4}$')]);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastMessage: ToastMessageService,
    private readonly utilService: UtilService
  ) { }

  ngOnInit(): void {
  }

  getOTP() {
    this.isLoading = true;
    const payload = {
      password: "1234",
      requestbody: {
        udiseCode: this.udiseFormControl.value.toString()
      }
    }
    this.authService.getUDISEDetails(payload).subscribe((response) => {
      this.udiseDetails = response;
      this.isGetOTPClicked = true;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      console.error(error);
    })
  }

  submitOTP() {
    const payload = {
      school_name: this.udiseDetails.schoolName,
      school_id: this.udiseDetails.udiseCode,
      // name: this.authService.currentUser?.name,
      // dob: this.authService.currentUser?.dob,
      // gender: this.authService.currentUser?.gender
    }

    this.authService.linkUDISE(payload).subscribe((res: any) => {
      this.isUDISEVerified = true;
      console.log("res", res);
      this.toastMessage.success('', this.utilService.translateString('SUCCESSFULLY_REGISTERED'));
      this.router.navigate(['/dashboard']);
    }, (error) => {
      this.isUDISEVerified = false;
      this.toastMessage.success('', this.utilService.translateString('UNABLE_TO_VERIFY_YOUR_UDISE'));
    });
  }
}
