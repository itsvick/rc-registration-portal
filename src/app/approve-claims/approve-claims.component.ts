import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-approve-claims',
  templateUrl: './approve-claims.component.html',
  styleUrls: ['./approve-claims.component.scss']
})
export class ApproveClaimsComponent implements OnInit {
  sidebarToggle: boolean = true;
  headerName: string = 'plain';



  constructor() { }

  ngOnInit(): void {

  }
  toggleSidebarMenu() {
    this.sidebarToggle = !this.sidebarToggle;
  }

}
