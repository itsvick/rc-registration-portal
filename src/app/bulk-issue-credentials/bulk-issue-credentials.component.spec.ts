import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkIssueCredentialsComponent } from './bulk-issue-credentials.component';

describe('BulkIssueCredentialsComponent', () => {
  let component: BulkIssueCredentialsComponent;
  let fixture: ComponentFixture<BulkIssueCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkIssueCredentialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkIssueCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
