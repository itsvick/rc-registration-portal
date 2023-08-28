import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';

@Component({
  template: ''
})
export class RegisterComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private readonly toastMessageService: ToastMessageService,
    private readonly utilService: UtilService
  ) { }

  ngOnInit(): void {
    const issuerId = localStorage.getItem('issuerId');

    if (issuerId) {
      this.router.navigate(['/form/instructor-signup'], { queryParams: { issuer_did: issuerId } });
    } else {
      this.toastMessageService.error('', this.utilService.translateString('PLEASE_SELECT_DEPARTMENT_FIRST'));
      this.router.navigate(['/']);
    }
  }
}
