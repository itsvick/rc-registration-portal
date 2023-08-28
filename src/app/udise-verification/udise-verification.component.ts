import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
  invalidUDISE = false;

  udiseFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{11}$')]);
  mobileFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]);
  otpFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]);

  constructor(
    private readonly authService: AuthService,
    private readonly toastMessage: ToastMessageService,
    private readonly utilService: UtilService,
    private readonly activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.udiseFormControl.valueChanges.subscribe((value: any) => {
      this.udiseFormControl.setValue(value.replace(/\D/g, ''), { emitEvent: false });
    });

    this.mobileFormControl.valueChanges.subscribe((value: any) => {
      this.mobileFormControl.setValue(value.replace(/\D/g, ''), { emitEvent: false });
    });

    this.otpFormControl.valueChanges.subscribe((value: any) => {
      this.otpFormControl.setValue(value.replace(/\D/g, ''), { emitEvent: false });
    });
  }

  closeModal(event) {
    event.stopPropagation();
    this.activeModal.dismiss('Cross click');
  }

  getOTP() {
    this.isLoading = true;
    const payload = {
      password: "123456",
      requestbody: {
        udiseCode: this.udiseFormControl.value.toString()
      }
    }
    this.authService.getUDISEDetails(payload).subscribe((response) => {
      this.isLoading = false;
      if (!response?.udiseCode) {
        this.invalidUDISE = true;
      } else {
        this.udiseDetails = response;
        this.isGetOTPClicked = true;
      }
    }, error => {
      this.isLoading = false;
      console.error(error);
    })
  }

  submitOTP() {
    const payload = {
      school_name: this.udiseDetails.schoolName,
      school_id: this.udiseDetails.udiseCode,
    }

    this.authService.linkUDISE(payload).subscribe((res: any) => {
      console.log("res", res);
      this.activeModal.close();
    }, (error) => {
      this.toastMessage.success('', this.utilService.translateString('UNABLE_TO_VERIFY_YOUR_UDISE'));
    });
  }
}
