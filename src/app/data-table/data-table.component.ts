import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastMessageService } from '../services/toast-message/toast-message.service';

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
  constructor(
    private readonly toastMsg: ToastMessageService
  ) { }

  ngOnInit(): void {
    this.pageChange();
  }


  pageChange() {
    this.data = this.data.map((item, index) => {
      return { ...item, rowId: index + 1 }
    });
    this.tableData = this.data.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );

    if (this.page === 1) {
      this.indexCount = 0;
    } else {
      this.indexCount = (this.page - 1) * this.pageSize;
    }

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
    let selectedRows = this.data.filter(x => x.checked).map(({ rowId, checked, ...rest }) => { return rest });

    if (!selectedRows.length) {
      this.toastMsg.error('', 'Please select at least one row');
      return;
    }
    this.issueCredentials.emit(selectedRows);
  }
}
