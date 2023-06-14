import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { GeneralService } from '../services/general/general.service';
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

  showInstructions = false;
  constructor(
    private readonly generalService: GeneralService,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly schemaService: SchemaService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
  ) { }

  ngOnInit(): void {
    this.initialize();
    this.getRouteData();

    if (this.router.url === '/dashboard/register-entity') {
      this.showInstructions = true;
    }

    // this.generalService.languageChange.subscribe((res) => {
    //   this.initialize();
    // });

    this.translate.onLangChange.subscribe(_ => {
      this.initialize();
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
    // this.authService.doLogout();
  }

  getRouteData() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showInstructions = event.url === '/dashboard/register-entity';
      });
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
