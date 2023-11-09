import { TestBed } from '@angular/core/testing';

import { DdiService } from './ddi.service';
import { HttpClientModule } from '@angular/common/http';

describe('DdiService', () => {
  let service: DdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(DdiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
