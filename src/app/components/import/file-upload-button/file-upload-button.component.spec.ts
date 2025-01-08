// Path: src/app/components/import/file-upload-button/file-upload-button.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadButtonComponent } from './file-upload-button.component';

describe('FileUploadButtonComponent', () => {
  let component: FileUploadButtonComponent;
  let fixture: ComponentFixture<FileUploadButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileUploadButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
