import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReissueCredentialsComponent } from './reissue-credentials.component';

describe('ReissueCredentialsComponent', () => {
  let component: ReissueCredentialsComponent;
  let fixture: ComponentFixture<ReissueCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReissueCredentialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReissueCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
