import { Component, OnInit } from '@angular/core';
import { FieldType, FieldWrapper } from '@ngx-formly/core';
import { DataService } from 'src/app/services/data/data-request.service';

@Component({
  selector: 'select-wrapper',
  template: `
  <div class="form-group">
    <label>{{to.label}}</label>
    <ng-container #fieldComponent></ng-container>
  </div>
  `,
})
export class SelectWrapper extends FieldWrapper {

  constructor(private dataService: DataService) {
    super();
  }
  ngOnInit(): void {
    if (this.to.optionsApi) {
      this.dataService.get({ url: this.to.optionsApi }).subscribe((data: any) => {
        if (this.to.responsePath) {
          this.to.options = data[this.to.responsePath];
        } else {
          this.to.options = data;
        }
      });
    }
  }
}
