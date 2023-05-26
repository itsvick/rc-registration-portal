import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UdiseLinkComponent } from './udise-link.component';

describe('UdiseLinkComponent', () => {
  let component: UdiseLinkComponent;
  let fixture: ComponentFixture<UdiseLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UdiseLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UdiseLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
