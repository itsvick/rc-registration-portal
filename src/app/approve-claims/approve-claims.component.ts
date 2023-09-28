import { Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ClaimService } from '../services/claim.service';
import * as dayjs from 'dayjs';
import { forkJoin } from 'rxjs';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

@Component({
  selector: 'app-approve-claims',
  templateUrl: './approve-claims.component.html',
  styleUrls: ['./approve-claims.component.scss']
})
export class ApproveClaimsComponent implements OnInit {
  sidebarToggle: boolean = true;
  headerName: string = 'plain';
  claimList: any[] = [];
  selectedClaims: any[] = [];
  isLoading = false;
  isBackdropLoader = false;
  selectedClaimDetails: any;

  detailsModalRef: NgbModalRef;
  @ViewChild('approvalSuccessModal') approvalSuccessModal: TemplateRef<any>;
  @ViewChild('detailsModal') detailsModal: TemplateRef<any>;
  constructor(
    private readonly claimService: ClaimService,
    private readonly toastService: ToastMessageService,
    public readonly utilService: UtilService,
    private readonly modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.searchClaims();
  }
  toggleSidebarMenu() {
    this.sidebarToggle = !this.sidebarToggle;
  }

  searchClaims() {
    this.isLoading = true;
    this.claimService.searchClaims().subscribe((res: any) => {
      this.isLoading = false;
      res = res.map((item: any) => {
        return { ...item, selected: false }
      });
      this.claimList = [];
      this.claimList = [...res];
    }, error => {
      this.isLoading = false;
      console.error("error", error);
    })
  }

  getAttestRequestBody(status: string, claimDetails: any) {
    let currentDate = dayjs();
    const data = {
      claim_status: status,
      claim_os_id: claimDetails.claim_os_id,
      issuanceDate: currentDate.toISOString(),
      expirationDate: currentDate.add(1, 'year').toISOString(),
    }

    return this.claimService.attestClaim(data);
  }

  attestClaim(status: string, claimDetails: any) {
    this.isBackdropLoader = true;
    let currentDate = dayjs();
    const data = {
      claim_status: status,
      claim_os_id: claimDetails.osid,
      issuanceDate: status === 'approved' ? currentDate.toISOString() : '-',
      expirationDate: status === 'approved' ? currentDate.add(1, 'year').toISOString() : '-',
    }
    this.claimService.attestClaim(data).subscribe(res => {
      this.isBackdropLoader = false;
      const ref = this.modalService.open(AlertModalComponent, { centered: true });
      const key = status === 'approved' ? 'CLAIMS_APPROVED_SUCCESSFULLY' : 'CLAIMS_REJECTED_SUCCESSFULLY';
      ref.componentInstance.modalMessage = this.utilService.translateString(key);
      ref.componentInstance.isSuccess = true;
      this.searchClaims();
    }, error => {
      this.isBackdropLoader = false;
      const ref = this.modalService.open(AlertModalComponent, { centered: true });
      ref.componentInstance.modalMessage = this.utilService.translateString('UNABLE_TO_PROCESS_REQUEST');
      ref.componentInstance.isSuccess = false;
      console.error("error", error);
    });
  }

  rejectMultipleClaims() {
    const toBeRejectedClaims = this.claimList.filter((item: any) => item.selected);
    if (!toBeRejectedClaims.length) {
      this.toastService.warning('', this.utilService.translateString('PLEASE_SELECT_ATLEAST_ONE_RECORD'));
      return;
    }
    const rejectionRequests = toBeRejectedClaims.map((item: any) => {
      return this.getAttestRequestBody('rejected', item);
    });

    forkJoin(...rejectionRequests).subscribe(res => {
      this.searchClaims();
    })
  }

  approveMultipleClaims() {
    const toBeApprovedClaims = this.claimList.filter((item: any) => item.selected);

    if (!toBeApprovedClaims.length) {
      this.toastService.warning('', this.utilService.translateString('PLEASE_SELECT_ATLEAST_ONE_RECORD'));
      return;
    }
    const approvalRequests = toBeApprovedClaims.map((item: any) => {
      return this.getAttestRequestBody('approved', item);
    });

    forkJoin(...approvalRequests).subscribe(res => {
      this.searchClaims();
    })
  }

  showDetails(claimDetails: any) {
    this.selectedClaimDetails = claimDetails.credentialSubject;

    this.detailsModalRef = this.modalService.open(this.detailsModal, { centered: true, size: 'lg' });
  }

  closeModal(type) {
    if (type === 'details' && this.detailsModalRef) {
      this.detailsModalRef.close();
    }
  }

}
