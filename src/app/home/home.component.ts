import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from '../services/general/general.service';
import { AppConfig } from '../app.config';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  installed: boolean = false;
  checkbox: any;
  myTemplate: any;
  constructor(
    public router: Router, 
    private config: AppConfig, 
    private httpClient: HttpClient,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    ) { }

  ngOnInit(): void {
    this.checkHtmlFile().subscribe((res) => {
      if (res) {
        this.myTemplate = res;
      }
    },
      (error) => {
        var handler = document.getElementById('menu-open-handler');
        var toggleInterval = setInterval(function () {
          this.checkbox = document.getElementById('menu-open');
          this.checkbox.checked = !this.checkbox.checked;
        }, 4000);

        handler.onclick = function () {
          clearInterval(toggleInterval);
        };
      }
    );


  }

  checkHtmlFile(): Observable<any> {
    return this.httpClient.get('/assets/config/home.html',{responseType:'text'})
      .pipe(
        map((html: any) => {
          // console.log('html',html);
          return html;
        }),
        catchError(error => {
          console.log(error);
          return of(false);
        })
      );
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
