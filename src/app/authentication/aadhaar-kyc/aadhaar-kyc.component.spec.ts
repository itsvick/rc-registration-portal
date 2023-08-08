import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AadhaarKycComponent } from './aadhaar-kyc.component';

describe('AadhaarKycComponent', () => {
  let component: AadhaarKycComponent;
  let fixture: ComponentFixture<AadhaarKycComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AadhaarKycComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AadhaarKycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
