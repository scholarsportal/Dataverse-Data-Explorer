import { TestBed } from '@angular/core/testing';

import { DdiService } from './ddi.service';
import { HttpClientModule } from '@angular/common/http';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

describe('DdiService', () => {
  let service: DdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, XMLBuilder, XMLParser],
    });
    service = TestBed.inject(DdiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
