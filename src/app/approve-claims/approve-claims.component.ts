import { Component, OnInit } from '@angular/core';
import { ClaimService } from '../services/claim.service';
import * as dayjs from 'dayjs';
import { forkJoin } from 'rxjs';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';

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
  constructor(
    private readonly claimService: ClaimService,
    private readonly toastService: ToastMessageService,
    private readonly utilService: UtilService
  ) { }

  ngOnInit(): void {
    this.searchClaims();

  }
  toggleSidebarMenu() {
    this.sidebarToggle = !this.sidebarToggle;
  }

  searchClaims() {
    this.claimService.searchClaims().subscribe((res: any) => {
      res = res.map((item: any) => {
        return { ...item, selected: false }
      });
      this.claimList = [...res];
      console.log("claimList", this.claimList);
    }, error => {
      console.log("error", error);
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
    let currentDate = dayjs();

    const data = {
      claim_status: status,
      claim_os_id: claimDetails.osid,
      issuanceDate: currentDate.toISOString(),
      expirationDate: currentDate.add(1, 'year').toISOString(),
    }
    this.claimService.attestClaim(data).subscribe(res => {
      this.searchClaims();
    });
  }

  rejectMultipleClaims() {
    const toBeRejectedClaims = this.claimList.filter((item: any) => item.selected);
    if (!toBeRejectedClaims.length){
      this.toastService.warning('', this.utilService.translateString('PLEASE_SELECT_ATLEAST_ONE_RECORD'));
      return;
    }
    const rejectionRequests = toBeRejectedClaims.map((item: any) => {
      return this.getAttestRequestBody('rejected', item);
    });

    forkJoin(...rejectionRequests).subscribe(res => {
      console.log("res", res);
      this.searchClaims();
    })
  }

  approveMultipleClaims() {
    const toBeApprovedClaims = this.claimList.filter((item: any) => item.selected);

    if (!toBeApprovedClaims.length){
      this.toastService.warning('', this.utilService.translateString('PLEASE_SELECT_ATLEAST_ONE_RECORD'));
      return;
    }
    const approvalRequests = toBeApprovedClaims.map((item: any) => {
      return this.getAttestRequestBody('approved', item);
    });

    forkJoin(...approvalRequests).subscribe(res => {
      console.log("res1", res);
      this.searchClaims();
    })
  }

}
