import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-aadhaar-kyc',
  templateUrl: './aadhaar-kyc.component.html',
  styleUrls: ['./aadhaar-kyc.component.scss']
})
export class AadhaarKycComponent implements OnInit {
  isGetOTPClicked = false

  aadhaarFormControl = new FormControl('', [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern('^[0-9]{12}$')]);
  otpFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]);
  consentFormControl = new FormControl(false, [Validators.required, Validators.requiredTrue]);

  successModalRef: NgbModalRef;
  @ViewChild("successModal") successModal: ElementRef;

  constructor(
    private readonly authService: AuthService,
    private readonly toastMessage: ToastMessageService,
    private readonly utilService: UtilService,
    public readonly activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.aadhaarFormControl.valueChanges.subscribe((value: any) => {
      this.aadhaarFormControl.setValue(value.replace(/\D/g, ''), { emitEvent: false });
    });

    this.otpFormControl.valueChanges.subscribe((value: any) => {
      this.otpFormControl.setValue(value.replace(/\D/g, ''), { emitEvent: false });
    });

  }

  getOTP() {
    this.isGetOTPClicked = true;
  }

  closeModal(event: MouseEvent) {
    this.activeModal.dismiss('Cross click');
  }

  submitOTP() {
    const payload = {
      aadhaar_id: this.aadhaarFormControl.value.toString(),
    }
    this.authService.aadhaarKYC(payload).subscribe((res: any) => {
      this.activeModal.close();

    }, (error) => {
      this.toastMessage.success('', this.utilService.translateString('UNABLE_TO_VERIFY_YOUR_AADHAAR'));
    });
  }
}
