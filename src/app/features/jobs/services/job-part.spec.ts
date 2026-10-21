import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { JobPartService } from './job-part';

describe('JobPartService', () => {
  let service: JobPartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(JobPartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
