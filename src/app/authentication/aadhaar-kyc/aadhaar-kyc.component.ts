import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { UtilService } from 'src/app/services/util/util.service';
import { IImpressionEventInput, IInteractEventInput } from '../../services/telemetry/telemetry.interface';
import { TelemetryService } from '../../services/telemetry/telemetry.service';

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
    public readonly activeModal: NgbActiveModal,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly router: Router
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
    this.raiseInteractEvent('aadhaar-kyc-get-otp-btn');
    this.isGetOTPClicked = true;
  }

  closeModal(event: MouseEvent) {
    this.raiseInteractEvent('aadhaar-kyc-close-modal');
    this.activeModal.dismiss('Cross click');
  }

  submitOTP() {
    this.raiseInteractEvent('aadhaar-kyc-submit-otp-btn');
    const payload = {
      aadhaar_id: this.aadhaarFormControl.value,
    }
    this.authService.aadhaarKYC(payload).subscribe((res: any) => {
      this.activeModal.close();

    }, (error) => {
      this.toastMessage.error('', this.utilService.translateString('UNABLE_TO_VERIFY_YOUR_AADHAAR'));
    });
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
