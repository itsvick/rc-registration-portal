import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { AuthService } from '../services/auth/auth.service';
import { BulkIssuanceService } from '../services/bulk-issuance/bulk-issuance.service';
import { CredentialService } from '../services/credential/credential.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

dayjs.extend(customParseFormat);

@Component({
  selector: 'app-issued-credentials',
  templateUrl: './issued-credentials.component.html',
  styleUrls: ['./issued-credentials.component.scss']
})
export class IssuedCredentialsComponent implements OnInit {

  credentials: any[] = [];
  issuedCredentials = [];
  isLoading = false;
  isBackdropLoader = false;
  page = 1;
  pageSize = 20;
  tableRows: any[] = [];
  tableColumns: any[] = [];
  tableData: any[] = [];
  model: any = {};
  schemas: any[];

  tableKeys: any[] = [];
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
    private readonly toastMsgService: ToastMessageService,
    public readonly utilService: UtilService
  ) { }

  ngOnInit(): void {
    if (!this.authService.isKYCCompleted()) {
      this.toastMsgService.error('', this.generalService.translateString('PLEASE_COMPLETE_YOUR_E_KYC_AND_UDISE'));
      this.router.navigate(['/dashboard/my-account']);
      return;
    }

    this.getSchemaList();
  }

  onModelChange() {
    const selectedSchema = this.schemas.find(item => item.schema_id === this.model?.schema);
    this.getCredentials(selectedSchema?.schema_name);
  }

  getSchemaList() {
    this.bulkIssuanceService.getSchemaList().subscribe((schemas: any) => {
      console.log(schemas);
      this.schemas = schemas;
    }, error => {
      console.log(error);
    });
  }

  getCredentials(schemaName: string) {
    this.isLoading = true;
    this.issuedCredentials = [];
    this.tableRows = [];
    this.page = 1;

    this.credentialService.getCredentials(this.authService.currentUser.issuer_did, schemaName) // replace issuer_did with did for issuer login
      .subscribe((res: any) => {
        this.isLoading = false;
        this.issuedCredentials = res;
        this.getCredentialStatus(res.map(item => item.id));
        const biggest = this.issuedCredentials.reduce((biggest, obj) => {
          if (Object.keys(biggest.credentialSubject).length > Object.keys(obj.credentialSubject).length) return biggest
          return obj;
        });

        this.tableKeys = Object.keys(biggest.credentialSubject);
        this.pageChange();
      }, (error: any) => {
        this.isLoading = false;
        this.issuedCredentials = [];
        if (error.status !== 400 || error?.error?.result?.error?.status !== 404) {
          this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_ISSUED_CREDENTIALS'));
        }
      });
  }

  getCredentialStatus(credList: any[]) {
    from(credList).pipe(
      mergeMap((id: string) => this.credentialService.getCredentialStatus(id).pipe(
        map(res => ({ id, status: res.status })), 
        catchError(error => {
          console.error(error);
          return of(null); // Continue with the next request even if one fails
        })
      ))
    ).subscribe((res: any) => {
      const index = this.issuedCredentials.findIndex(item => item.id === res.id);
      this.issuedCredentials[index].status = res.status;
      this.pageChange();
    })
  }

  viewCredential(credential: any) {
    this.credentialService.getSchema(credential.credentialSchemaId).subscribe((schema: any) => {
      credential.credential_schema = Array.isArray(schema) && schema.length ? schema[0] : schema;
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
