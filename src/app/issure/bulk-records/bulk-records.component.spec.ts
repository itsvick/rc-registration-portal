import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkRecordsComponent } from './bulk-records.component';

describe('BulkRecordsComponent', () => {
  let component: BulkRecordsComponent;
  let fixture: ComponentFixture<BulkRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkRecordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
