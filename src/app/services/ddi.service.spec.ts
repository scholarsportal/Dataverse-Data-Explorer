import { TestBed } from '@angular/core/testing';

import { DdiService } from './ddi.service';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';

describe('DdiService', () => {
  let service: DdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(), provideHttpClient()]
    });
    service = TestBed.inject(DdiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
