import { TestBed } from '@angular/core/testing';

import { DdiService } from './ddi.service';

describe('DdiService', () => {
  let service: DdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DdiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
