import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { metaReducers, reducers } from './state/reducers';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      // Add this line for "No Store Provided" error
      imports: [
        StoreModule.forRoot(reducers, { metaReducers }),
        AppComponent
      ],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
