import { TestBed } from '@angular/core/testing';

import { BulkIssuanceService } from './bulk-issuance.service';

describe('BulkIssuanceService', () => {
  let service: BulkIssuanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkIssuanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
