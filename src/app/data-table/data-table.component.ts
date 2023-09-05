import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry.interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {

  @Input() data: any[];
  @Input() pageSize: number = 10;

  @Output() issueCredentials = new EventEmitter();
  page = 1;
  tableData: any[] = [];
  indexCount = 0;
  endPageCount = 0;
  constructor(
    private readonly toastMsg: ToastMessageService,
    private readonly utilService: UtilService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService
  ) { }

  ngOnInit(): void {
    this.pageChange();
  }


  pageChange() {
    // this.data = this.data.map((item, index) => {
    //   return { ...item, rowId: index + 1 }
    // });
    this.tableData = this.data.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );

    if (this.page === 1) {
      this.indexCount = 0;
    } else {
      this.indexCount = (this.page - 1) * this.pageSize;
    }

    this.endPageCount = this.data?.length > (this.pageSize * this.page) ? this.pageSize * this.page : this.data.length;
    console.log("this.tble", this.tableData)
  }


  checkAllCheckBox(ev: any) {
    this.data.forEach(x => x.checked = ev.target.checked)
  }

  isAllCheckBoxChecked() {
    return this.data.every(p => p.checked);
  }

  onCheckboxChange(event, index: number) {
    if (this.page > 1) {
      index = index + (this.page - 1) * this.pageSize;
    }
    this.data[index].checked = event.target.checked;
    console.log("evet", event);
  }

  check() {
    console.log("data", this.data.filter(x => x.checked));
  }

  onIssueCredentials() {
    this.raiseInteractEvent('issue-credential-btn');
    // const rows = [...this.data.map((item, index) => {
    //   return { ...item, rowId: index + 1 }
    // })];

    let selectedRows = this.data.filter((item, index) => item.checked)
      .map(({ checked, ...rest }) => { return rest });

    this.data = this.data.filter((item) => !item.checked);
    this.pageChange();

    if (!selectedRows.length) {
      this.toastMsg.error('', this.utilService.translateString('PLEASE_SELECT_ATLEAST_ONE_RECORD'));
      return;
    }
    this.issueCredentials.emit(selectedRows);
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
