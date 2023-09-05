import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '../services/data/schema.service';
import { IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { AuthService } from '../services/auth/auth.service';
import { UtilService } from '../services/util/util.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() sidebarFor: string = 'default';
  menuList: any[];
  isKYCCompleted = false;

  constructor(
    private readonly router: Router,
    private readonly schemaService: SchemaService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly authService: AuthService,
    private readonly utilService: UtilService
  ) { }

  ngOnInit(): void {
    this.isKYCCompleted = this.authService.isKYCCompleted();
    this.initialize();
    this.utilService.kycCompleted.subscribe((res) => {
      console.log("res====>", res);
      this.isKYCCompleted = res;
    });
  }

  initialize() {
    this.schemaService.getSidebarJson().subscribe((sidebarSchema: any) => {
      const filtered = sidebarSchema.sidebar.filter(obj => {
        return Object.keys(obj)[0] === this.sidebarFor;
      });
      this.menuList = filtered[0][this.sidebarFor];
    });
  }

  logout() {
    this.raiseInteractEvent('logout-btn')
    this.router.navigate(['/logout']);
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
}
