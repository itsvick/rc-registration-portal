import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '../services/data/schema.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() sidebarFor: string = 'default';
  menuList: any[];

  constructor(
    private readonly router: Router,
    private readonly schemaService: SchemaService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
  ) { }

  ngOnInit(): void {
    this.initialize();
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
