import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { ClaimService } from '../services/claim.service';
import { BulkIssuanceService } from '../services/bulk-issuance/bulk-issuance.service';
import { UtilService } from '../services/util/util.service';
import { CredentialService } from '../services/credential/credential.service';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reissue-credentials',
  templateUrl: './reissue-credentials.component.html',
  styleUrls: ['./reissue-credentials.component.scss']
})
export class ReissueCredentialsComponent implements OnInit {

  correctionRequests: any[] = [];
  credentials: any[] = [];
  allCorrectionRequests = [];
  isLoading = false;
  isBackdropLoader = false;
  page = 1;
  pageSize = 20;
  tableRows: any[] = [];
  tableColumns: any[] = [];
  tableData: any[] = [];
  model: any = {};
  schemas: any[];
  grievanceList = [];
  selectedGrievance: any;
  selectedCredential: any;
  issuedCredentials = [];
  reissueForm: FormGroup;
  fields = [];

  grievanceDetailsModalRef: NgbModalRef;
  credentialDetailsModalRef: NgbModalRef;
  @ViewChild('grievanceDetailsModal') grievanceDetailsModal: TemplateRef<any>;
  @ViewChild('credentialDetailsModal') credentialDetailsModal: TemplateRef<any>;
  constructor(
    private readonly modalService: NgbModal,
    private readonly claimService: ClaimService,
    private readonly bulkIssuanceService: BulkIssuanceService,
    public readonly utilService: UtilService,
    private readonly credentialService: CredentialService,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getSchemaList();
    // this.getCorrectionRequests();
    // setTimeout(() => {
    //   const ref = this.modalService.open(AlertModalComponent, { centered: true });
    //   ref.componentInstance.modalMessage = "Credentials Issued successfully";
    //   ref.componentInstance.isSuccess = true;
    // }, 5000);
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
    const selectedSchema = this.schemas.find(item => item.schema_id === this.model?.schema);
    this.getCredentials(selectedSchema.schema_name);
    // if (this.allCorrectionRequests?.length) {
    //   console.log("correctionRequests", this.correctionRequests);

    //   this.correctionRequests = this.allCorrectionRequests;
    //   // .filter((item: any) => item.schemaId === this.model?.schema);
    //   this.pageChange();
    // }
  }

  getCorrectionRequests() {
    this.claimService.getCorrectionRequests().subscribe((res: any) => {
      this.grievanceList = res.result;
      this.getCredentialDetails(res.result);
      // this.correctionRequests = res.result;
    }, error => {
      const ref = this.modalService.open(AlertModalComponent, { centered: true });
      ref.componentInstance.modalMessage = "Unable to get correction requests";
      ref.componentInstance.isSuccess = false;
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
        this.issuedCredentials = res.filter(item => item.credentialSchemaId === this.model?.schema);
        this.pageChange();
      }, (error: any) => {
        this.isLoading = false;
        this.issuedCredentials = [];
        if (error.status !== 400 || error?.error?.result?.error?.status !== 404) {
          // this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_ISSUED_CREDENTIALS'));
        }
      });
  }

  getCredentialDetails(grievanceList) {

    // forkJoin(grievanceList.map((item: any) => this.credentialService.getCredentialByCredentialId(item.credential_schema_id)))
    //   .subscribe((res: any) => {
    //     console.log("ressss", res);
    //   })

    this.credentialService.getCredentialByCredentialId(grievanceList[1].credential_schema_id).subscribe((res: any) => {
      console.log("ressss", res);
      this.correctionRequests = [res];
      this.pageChange();
    });
  }

  getCredentialDetailsRequest(credentialId: string) {

  }

  showGrievanceDetails(credentialId: string) {
    console.log("credentialId", credentialId);
    this.selectedGrievance = this.grievanceList.find((item: any) => item.credential_schema_id === credentialId);
    this.grievanceDetailsModalRef = this.modalService.open(this.grievanceDetailsModal, { centered: true });
  }

  pageChange() {
    this.tableData = this.issuedCredentials.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  reIssueCredential(credentialId: string) {
    this.claimService.reIssueCredential(credentialId).subscribe(res => {
      const ref = this.modalService.open(AlertModalComponent, { centered: true });
      ref.componentInstance.modalMessage = this.utilService.translateString('CREDENTIAL_UPDATED_SUCCESSFULLY');
      ref.componentInstance.isSuccess = true;
      this.getCorrectionRequests();
    }, error => {
      const ref = this.modalService.open(AlertModalComponent, { centered: true });
      ref.componentInstance.modalMessage = this.utilService.translateString('FAILED_TO_UPDATE_CREDENTIAL');
      ref.componentInstance.isSuccess = false;
    });
  }


  submitReissueForm(event) {
    if (this.reissueForm.valid) {
      console.log("this.reissueForm.value", this.reissueForm.value);
      // this.onIssueCredentials([this.reissueForm.value]);
      this.credentialService.reissueCredential(this.reissueForm.value).subscribe(res => {
        this.issuedCredentials = this.issuedCredentials.filter((item: any) => item.id !== this.selectedCredential.id);
        const ref = this.modalService.open(AlertModalComponent, { centered: true });
        ref.componentInstance.modalMessage = this.utilService.translateString('CREDENTIAL_UPDATED_SUCCESSFULLY');
        ref.componentInstance.isSuccess = true;
      });
    }
  }

  showCredentialDetails(credential: any) {
    this.selectedCredential = credential;
    const formGroupFields = this.getFormControlsFields(credential.credentialSubject);
    this.reissueForm = new FormGroup(formGroupFields);

    this.reissueForm.setValue(this.getKeyValue());
    this.credentialDetailsModalRef = this.modalService.open(this.credentialDetailsModal, { centered: true });
  }


  getKeyValue() {
    const fieldVal = {};
    this.fields.forEach(item => {
      fieldVal[item.key] = item.value;
    });

    console.log("fieldVal", fieldVal);
    return fieldVal;
  }


  getFormControlsFields(formFields) {
    const formGroupFields = {};

    for (let item in formFields) {
      formGroupFields[item] = new FormControl("", Validators.required);
      this.fields.push({
        key: item,
        type: 'text',
        isRequired: true,
        label: this.utilService.variableNameToReadableString(item),
        value: formFields[item]
      });
    }
    console.log("fields", this.fields);
    return formGroupFields;
  }


  closeModal(type) {
    if (type === 'details' && this.credentialDetailsModalRef) {
      this.credentialDetailsModalRef.close();
    }
  }

}
