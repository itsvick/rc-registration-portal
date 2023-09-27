import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth/auth.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    private readonly activeModal: NgbActiveModal,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly router: Router
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
    this.raiseInteractEvent('verify-udise-close-modal')
    event.stopPropagation();
    this.activeModal.dismiss('Cross click');
  }

  getOTP() {
    this.raiseInteractEvent('verify-udise-get-otp-btn');
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
    });

    // const payload1 = {
    //   udiseCode: this.udiseFormControl.value,
    //   mobile: this.mobileFormControl.value
    // }
    // this.authService.verifyUDISEMobile(payload1).subscribe((response) => {
    //   console.log("response", response);
    // });
  }

  submitOTP() {
    this.raiseInteractEvent('verify-udise-submit-otp-btn');
    const payload = {
      school_name: this.udiseDetails.schoolName,
      school_id: this.udiseDetails.udiseCode,
      school_mobile: this.udiseDetails?.mobile || "-",
    }

    this.authService.linkUDISE(payload).subscribe((res: any) => {
      console.log("res", res);
      this.activeModal.close();
    }, (error) => {
      this.toastMessage.success('', this.utilService.translateString('UNABLE_TO_VERIFY_YOUR_UDISE'));
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
