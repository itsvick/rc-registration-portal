import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  accountDetails: any;
  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.accountDetails = this.authService.currentUser;
  }

}
