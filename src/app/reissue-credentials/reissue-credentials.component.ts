import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { ClaimService } from '../services/claim.service';
import { BulkIssuanceService } from '../services/bulk-issuance/bulk-issuance.service';
import { UtilService } from '../services/util/util.service';

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

  constructor(
    private readonly modalService: NgbModal,
    private readonly claimService: ClaimService,
    private readonly bulkIssuanceService: BulkIssuanceService,
    private readonly utilService: UtilService
  ) { }

  ngOnInit(): void {
    this.getSchemaList();
    this.getCorrectionRequests();
    setTimeout(() => {
      const ref = this.modalService.open(AlertModalComponent, { centered: true });
      ref.componentInstance.modalMessage = "Credentials Issued successfully";
      ref.componentInstance.isSuccess = true;
    }, 5000);
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
    // this.getCredentials();
    if (this.allCorrectionRequests?.length) {
      console.log("correctionRequests", this.correctionRequests);

      this.correctionRequests = this.allCorrectionRequests;
      // .filter((item: any) => item.schemaId === this.model?.schema);
      this.pageChange();
    } else {
      this.getCorrectionRequests();
    }
  }

  getCorrectionRequests() {
    this.claimService.getCorrectionRequests().subscribe(res => {
      this.correctionRequests = res;
    }, error => {
      const ref = this.modalService.open(AlertModalComponent, { centered: true });
      ref.componentInstance.modalMessage = "Unable to get correction requests";
      ref.componentInstance.isSuccess = false;
    });
  }

  pageChange() {
    this.tableData = this.correctionRequests.slice(
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

}
