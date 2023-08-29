import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { forkJoin, of } from 'rxjs';
import { concatMap, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { BulkIssuanceService } from '../services/bulk-issuance/bulk-issuance.service';
import { CredentialService } from '../services/credential/credential.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';


dayjs.extend(customParseFormat);

@Component({
  selector: 'app-issued-credentials',
  templateUrl: './issued-credentials.component.html',
  styleUrls: ['./issued-credentials.component.scss']
})
export class IssuedCredentialsComponent implements OnInit {

  credentials: any[] = [];
  issuedCredentials = [];
  allIssuedCredentials = [];
  isLoading = false;
  isBackdropLoader = false;
  page = 1;
  pageSize = 20;
  tableRows: any[] = [];
  tableColumns: any[] = [];
  tableData: any[] = [];
  model: any = {};
  schemas: any[];
  onCompare(_left: KeyValue<any, any>, _right: KeyValue<any, any>): number {
    return -1;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly toastMessage: ToastMessageService,
    private readonly router: Router,
    private readonly credentialService: CredentialService,
    private readonly generalService: GeneralService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly bulkIssuanceService: BulkIssuanceService,
    private readonly toastMsgService: ToastMessageService
  ) { }

  ngOnInit(): void {
    if(!this.authService.isKYCCompleted()) {
      this.toastMsgService.error('', this.generalService.translateString('PLEASE_COMPLETE_YOUR_E_KYC_AND_UDISE'));
      this.router.navigate(['/dashboard/my-account']);
      return;
    }

    this.getCredentials();
    this.getSchemaList();
  }

  reset() {
    if (Object.keys(this.model).length) {
      this.model = {};
      this.getCredentials();
    }
  }

  onModelChange() {
    // this.getCredentials();
    if (this.allIssuedCredentials?.length) {
      console.log("issuedCredentials", this.issuedCredentials);

      this.issuedCredentials = this.allIssuedCredentials.filter((item: any) => item.schemaId === this.model?.schema);
      // this.tableColumns = Object.keys(this.issuedCredentials?.[0]?.credentialSubject) || [];
      this.pageChange();
    } else {
      this.getCredentials();
    }
  }

  onChange(event) {
    // console.log("event", this.selectedType);
    // this.getCredentials();
    // console.log(this.model);
  }

  getSchemaList() {
    this.bulkIssuanceService.getSchemaList().subscribe((schemas: any) => {
      console.log(schemas);
      this.schemas = schemas;
    }, error => {
      console.log(error);
    });
  }

  getCredentials() {
    // this.isLoading = true;
    this.isBackdropLoader = true;
    this.issuedCredentials = [];
    this.tableRows = [];
    this.page = 1;

    this.credentialService.getCredentials(this.authService.currentUser.issuer_did) // replace issuer_did with did for issuer login
      .pipe(switchMap((credentials: any) => {
        if (credentials.length) {
          return forkJoin(
            credentials.map((cred: any) => {
              return this.credentialService.getCredentialSchemaId(cred.id).pipe(
                concatMap((res: any) => {
                  console.log("res", res);
                  cred.schemaId = res.credential_schema;
                  return of(cred);
                })
              );
            })
          );
        }
        return of([]);
      }))
      .subscribe((res: any) => {
        // this.isLoading = false;
        this.isBackdropLoader = false;
        this.allIssuedCredentials = res;
        // this.pageChange();
      }, (error: any) => {
        // this.isLoading = false;
        this.isBackdropLoader = false;
        this.allIssuedCredentials = [];
        if (error.status !== 400 || error?.error?.result?.error?.status !== 404) {
          this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_ISSUED_CREDENTIALS'));
        }
      });
  }

  viewCredential(credential: any) {
    this.credentialService.getSchema(credential.schemaId).subscribe((schema: any) => {
      credential.credential_schema = schema;
      const navigationExtra: NavigationExtras = {
        state: credential
      }
      this.router.navigate(['/dashboard/doc-view'], navigationExtra);
    }, (error: any) => {
      console.error(error);
      this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_ISSUED_CREDENTIALS'));
    });
  }

  pageChange() {
    this.tableData = this.issuedCredentials.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  ngAfterViewInit(): void {
    this.raiseImpressionEvent();
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
