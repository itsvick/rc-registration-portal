import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general/general.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { IImpressionEventInput, IInteractEventInput } from '../../services/telemetry/telemetry.interface';

@Component({
  selector: 'app-udise-link',
  templateUrl: './udise-link.component.html',
  styleUrls: ['./udise-link.component.scss']
})
export class UdiseLinkComponent implements OnInit {

  isFormSubmitted = false;
  udiseLinkForm = new FormGroup({
    udiseId: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
  })
  constructor(
    private readonly generalService: GeneralService,
    private readonly toastMessage: ToastMessageService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
  ) { }

  ngOnInit(): void {
    this.isFormSubmitted = false;
  }

  get udiseLinkFormControl() {
    return this.udiseLinkForm.controls;
  }

  verifyUDISE() {
    if (this.udiseLinkForm.invalid) {
      return;
    }
    this.isFormSubmitted = true;
    const payload = {
      "requestbody": {
        "udiseCode": this.udiseLinkForm.value.udiseId
      },
      password: this.udiseLinkForm.value.password
    }

    // this.router.navigate(['/form/instructor-signup']);

    this.generalService.postData('/v1/school/verify', payload, true).subscribe((res: any) => {
      this.isFormSubmitted = false;
      if (res?.status) {
        if (res?.response?.data) {
          localStorage.setItem('instituteDetails', JSON.stringify(res.response.data));
          this.router.navigate(['/form/instructor-signup'], { queryParams: { ls: 'instituteDetails,userDetails' } });
        }
      } else {
        this.toastMessage.error('', this.generalService.translateString('INVALID_SCHOOL_UDISE_OR_PASSWORD'));
      }
    }, error => {
      this.isFormSubmitted = false;
      console.error(error);
      this.toastMessage.error('', this.generalService.translateString('INVALID_SCHOOL_UDISE_OR_PASSWORD'));
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
