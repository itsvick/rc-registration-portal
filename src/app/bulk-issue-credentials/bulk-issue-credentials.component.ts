import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as Papa from "papaparse";
import { BulkIssuanceService } from '../services/bulk-issuance/bulk-issuance.service';
import { CsvService } from '../services/csv/csv.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';
import { AuthService } from '../services/auth/auth.service';

/**
 * An object used to get page information from the server
 */
export class Page {
  // The number of elements in the page
  size: number = 0;
  // The total number of elements
  totalElements: number = 0;
  // The total number of pages
  totalPages: number = 0;
  // The current page number
  pageNumber: number = 0;
}

@Component({
  selector: 'app-bulk-issue-credentials',
  templateUrl: './bulk-issue-credentials.component.html',
  styleUrls: ['./bulk-issue-credentials.component.scss']
})
export class BulkIssueCredentialsComponent implements OnInit, AfterViewInit {

  model: any = {};
  schemas: any[];
  schemaDetails: any;
  strictLoader: boolean = false;

  csvObject: any;
  tableColumns: any[] = [];

  downloadModalRef: NgbModalRef;
  @ViewChild("downloadModal") downloadModal: ElementRef;
  @ViewChild('fileUpload') fileUpload: ElementRef<HTMLElement>;

  constructor(
    private readonly toastMsg: ToastMessageService,
    private readonly bulkIssuanceService: BulkIssuanceService,
    private readonly generalService: GeneralService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly csvService: CsvService,
    private readonly utilService: UtilService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService,
    private readonly toastMsgService: ToastMessageService
  ) { }

  ngOnInit(): void {
    if(!this.authService.isKYCCompleted()) {
      this.toastMsgService.error('', this.utilService.translateString('PLEASE_COMPLETE_YOUR_E_KYC_AND_UDISE'));
      this.router.navigate(['/dashboard/my-account']);
      return
    }
    this.getSchemaList();
  }

  getSchemaList() {
    this.bulkIssuanceService.getSchemaList().subscribe((schemas: any) => {
      console.log(schemas);
      this.schemas = schemas;
    }, error => {
      console.log(error);
    });
  }

  onModelChange() {
    this.raiseInteractEvent('select-credential-type-btn')
    // get the schema fields based on the selected schema
    this.generateCSV();
  }

  openFileBrowser() {
    if (this.model?.schema) {
      this.fileUpload.nativeElement.click();
    } else {
      this.toastMsg.warning('', this.generalService.translateString('PLEASE_SELECT_SCHEMA_FIRST'));
    }
  }

  generateCSV() {
    this.bulkIssuanceService.getSchemaFields(this.model.schema).subscribe((schemaDetails: any) => {
      console.log(schemaDetails);
      this.schemaDetails = schemaDetails;
    });
  }

  downloadTemplate() {
    if (!this.model?.schema?.length) {
      this.toastMsg.warning('', this.generalService.translateString('PLEASE_SELECT_SCHEMA_FIRST'));
      return;
    }

    console.log("schema", this.model.schema);
    console.log("id", this.schemaDetails.id);

    if (this.model?.schema === this.schemaDetails?.id) {
      let columnFields = [...this.schemaDetails.required, ...this.schemaDetails.optional];
      columnFields = [...new Set(columnFields.map(item => item.trim()))]; //Remove spaces and duplicates
      const csvContent = this.csvService.generateCSV(columnFields, []);
      this.csvService.downloadCSVTemplate(csvContent, `${this.schemaDetails.schemaid}-template.csv`);
    }
  }


  public async importDataFromCSV(event: any) {
    // this.strictLoader = true;
    try {
      const parsedCSV = await this.parseCSVFile(event);

      if (!parsedCSV.length) {
        throw new Error(this.generalService.translateString('IT_SEEMS_UPLOADED_EMPTY_CSV_FILE_PLEASE_UPLOAD_VALID_CSV'));
      }

      this.csvObject = parsedCSV;
      
      this.tableColumns = Object.keys(parsedCSV[0]).map((item) => {
        return { prop: item };
      });
      console.log("tableCOlumns", this.tableColumns);
      // .map((item) => {
      //   const key = this.utilService.variableNameToReadableString(item);
      //   return { name: key };
      // });
      console.log("parsedCSV", parsedCSV);
      // this.uploadCSVValues(parsedCSV);
    } catch (error) {
      this.strictLoader = false;
      const errorMessage = error?.message ? error.message : this.generalService.translateString('ERROR_WHILE_PARSING_CSV_FILE');
      this.toastMsg.error('', errorMessage);
      console.warn("Error while parsing csv file", error);
    }
  }

  parseCSVFile(inputValue): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(inputValue.target.files[0], {
        header: true,
        skipEmptyLines: true,
        error: (err) => {
          console.error("err", err);
          console.warn("Error while parsing CSV file", err);
          reject(err);
        },
        complete: (results) => {
          if (results?.errors?.length) {
            reject(results.errors[0]);
          } else {
            resolve(results.data);
          }
        }
      });
    });
  }

  onIssueCredentials(event) {
    console.log("event", event);
    this.strictLoader = true;
    this.uploadCSVValues(event);
  }

  uploadCSVValues(parsedCSV) {
    const isValidCSV = this.validateCSV(parsedCSV);
    console.log("parsedCSV", parsedCSV);

    if (!isValidCSV) {
      this.toastMsg.error("", this.generalService.translateString('SOME_FIELDS_MISSED'));
      return;
    }

    this.bulkIssuanceService.issueBulkCredentials(this.schemaDetails.id, parsedCSV).subscribe((response: any) => {
      this.strictLoader = false;
      console.log("response", response);
      this.generateBulkRegisterResponse(response);
      this.toastMsg.success("", this.generalService.translateString("CREDENTIAL_ISSUED_SUCCESSFULLY"))
    }, (error) => {
      this.strictLoader = false;
      console.error("Error", error);
      const errorMessage = error?.message ? error.message : this.generalService.translateString('ERROR_WHILE_ISSUING_CREDENTIALS');
      this.toastMsg.error("", errorMessage);
    });
  }

  validateCSV(parsedCSV) {
    const requiredFields = this.schemaDetails.required;
    const csvKeys = Object.keys(parsedCSV[0]);

    return requiredFields.every(value => csvKeys.includes(value));
  }


  generateBulkRegisterResponse(response: any) {
    const csv = response.map((item: any) => {
      return {
        ...item.studentDetails,
        status: item.status,
        error: item.status ? '' : item.error
      }
    });

    const csvData = Papa.unparse(csv, { quotes: true });
    this.utilService.downloadFile('report.csv', 'text/csv;charset=utf-8;', csvData);
    this.showDownloadModal();
  }

  showDownloadModal() {
    this.downloadModalRef = this.modalService.open(this.downloadModal, {
      animation: true,
      centered: true,
      size: 'sm'
    });
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
