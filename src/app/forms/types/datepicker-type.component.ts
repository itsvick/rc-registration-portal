import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import * as dayjs from 'dayjs';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
@Component({
  selector: 'app-datepicker',
  template: `
  <div class="form-group">
    <label *ngIf="to.label"> {{ to.label | translate}} </label>
    <input type="text" class="form-control calendar" placement="bottom" bsDatepicker [formlyAttributes]="field"
      #datePicker [bsConfig]="bsConfig" [placeholder]="to.placeholder" (bsValueChange)="onValueChange($event)"
       [formControl]="formControl"/>
  </div>
  `,
})
export class DatepickerTypeComponent extends FieldType implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  get theme(): string { return this.to.theme || 'theme-dark-blue'; }
  get dateInputFormat(): string { return this.to.dateInputFormat || 'MM/DD/YYYY'; }

  ngOnInit(): void {
    this.bsConfig = {
      dateInputFormat: this.dateInputFormat,
      showWeekNumbers: true,
      containerClass: this.theme,
      isAnimated: true,
      adaptivePosition: true,
      maxDate: new Date()
    };
  }

  onValueChange(event) {
    if (dayjs(event).isValid()) {
      const formattedDate = dayjs(event).format('DD/MM/YYYY');
      this.formControl.setValue(formattedDate, { emitEvent: false });
      this.field.formControl.setValue(formattedDate, { emitEvent: true });

      if (this.formControl.value !== this.model[this.field.key as any]) {
        this.model[this.field.key as any] = this.formControl.value;
        this.formControl.updateValueAndValidity();
      }
    }
  }
}
