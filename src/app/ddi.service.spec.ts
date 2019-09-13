import { TestBed, inject } from '@angular/core/testing';

import { DdiService } from './ddi.service';

describe('DdiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DdiService]
    });
  });

  it('should be created', inject([DdiService], (service: DdiService) => {
    expect(service).toBeTruthy();
  }));
});
