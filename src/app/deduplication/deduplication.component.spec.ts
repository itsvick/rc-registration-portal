import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeduplicationComponent } from './deduplication.component';

describe('DeduplicationComponent', () => {
  let component: DeduplicationComponent;
  let fixture: ComponentFixture<DeduplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeduplicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
