import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FieldType } from '@ngx-formly/core';

import { DataService } from 'src/app/services/data/data-request.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';

@Component({
  selector: 'verify-udise',
  styleUrls: ['../../forms.component.scss'],
  templateUrl: './verify-udise.type.html',
})
export class VerifyUdiseComponent extends FieldType {
  isVerified: boolean = false;
  otp: any;
  isNumberValid: boolean = true;
  isLoading = false;
  udiseDetails: any;
  verifyOtpModalRef: NgbModalRef;

  @ViewChild("verifyOtpModal") verifyOtpModal: ElementRef;

  constructor(
    private readonly dataService: DataService,
    private readonly toastMessage: ToastMessageService,
    private readonly modalService: NgbModal
  ) {
    super();
  }

  async verifyUDISE(event: MouseEvent | KeyboardEvent, fieldKey: string) {
    event.preventDefault();
    console.log('field', this.field);
    if (this.formControl.valid) {
      this.isLoading = true;
      const payload = {
        url: this.to.UDISEDetailsAPI,
        data: {
          password: "1234",
          requestbody: {
            udiseCode: this.formControl.value
          }
        }
      }
      this.dataService.post(payload).subscribe((data) => {
        console.log('data', data);
        this.isLoading = false;
        if (!data.status) {
          const error = data?.response?.errorDetails?.message || 'Unable to fetch UDISE details';
          this.toastMessage.error('', error);
          return;
        }
        this.udiseDetails = data?.response?.data;
        this.openOtpPopup();
      }, (error) => {
        this.isLoading = false;
        this.formControl.setValue('', { emitEvent: true });
        // this.selectProfile();
        // this.noLinkedAbha = true;
        console.log(error);
      });
    } else {
      this.isNumberValid = false;
    }
  }

  patchFormValues() {
    const schoolDetails = {
      school_name: this.udiseDetails.schoolName || '',
      school_id: this.udiseDetails.udiseCode || '',
    }
    this.form.patchValue(schoolDetails, { emitEvent: true });
  }

  submitOtp() {
    if (this.otp) {
      this.isVerified = true;
      this.patchFormValues();
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