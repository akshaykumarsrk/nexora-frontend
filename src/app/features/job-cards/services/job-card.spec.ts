import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { JobCardService } from './job-card';

describe('JobCardService', () => {
  let service: JobCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(JobCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
