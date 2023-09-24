import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent implements OnInit {

  @Input() modalMessage: string;
  @Input() isSuccess: boolean = true;
  constructor() { }

  ngOnInit(): void {
  }

}
