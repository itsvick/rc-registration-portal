import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FieldType } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';

import { DataService } from 'src/app/services/data/data-request.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'verify-mobile',
  styleUrls: ['../../forms.component.scss'],
  templateUrl: './verify-aadhaar.type.html',
})
export class VerifyAadhaarComponent extends FieldType {
  isVerified: boolean = false;
  otp: any;
  isNumberValid: boolean = true;
  errorMessage: any;
  isLoading = false;
  aadhaarToken: string;
  verifyOtpModalRef: NgbModalRef;

  @ViewChild("verifyOtpModal") verifyOtpModal: ElementRef;

  constructor(
    private readonly dataService: DataService,
    private readonly utilService: UtilService,
    private readonly toastMessage: ToastMessageService,
    private readonly modalService: NgbModal
  ) {
    super();
  }

  async verifyAadhaar(event: MouseEvent | KeyboardEvent, fieldKey: string) {
    event.preventDefault();
    console.log('field', this.field);
    if (this.formControl.valid) {
      this.isLoading = true;
      const payload = {
        url: this.to.AadhaarVerifyAPI,
        data: {
          aadhaar_id: this.formControl.value,
        }
      }
      this.dataService.post(payload).subscribe((data) => {
        console.log('data', data);
        this.isLoading = false;

        if (!data.status) {
          const error = data?.response?.errorDetails?.message || this.utilService.translateString('UNABLE_TO_FETCH_DETAILS');
          this.toastMessage.error('', error);
          return;
        }
        this.aadhaarToken = data?.result?.uuid;
        this.openOtpPopup();
      }, (error) => {
        this.isLoading = false;
        this.toastMessage.error('', this.utilService.translateString('UNABLE_TO_FETCH_DETAILS'));
        this.formControl.setValue('', { emitEvent: true });
        console.log(error);
      });
    } else {
      this.isNumberValid = false;
    }
  }

  submitOtp() {
    if (this.otp) {
      this.isVerified = true;
      this.form.patchValue({ kyc_aadhaar_token: this.aadhaarToken }, { emitEvent: true });
      this.verifyOtpModalRef.dismiss();
      this.field.templateOptions.disabled = true;
    }
  }

  openOtpPopup() {
    this.verifyOtpModalRef = this.modalService.open(this.verifyOtpModal, { size: 'sm' });
  }

  closeOtpPopup() {
    this.verifyOtpModalRef.close();
  }
}