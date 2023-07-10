import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuedCredentialsComponent } from './issued-credentials.component';

describe('IssuedCredentialsComponent', () => {
  let component: IssuedCredentialsComponent;
  let fixture: ComponentFixture<IssuedCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssuedCredentialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuedCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
