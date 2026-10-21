import { vi } from 'vitest';
import { of } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobDetails } from './job-details';
import { JobService } from '../services/job';
import { JobPartService } from '../services/job-part';

describe('JobDetails', () => {
  let component: JobDetails;
  let fixture: ComponentFixture<JobDetails>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDetails],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}), params: {}, queryParams: {}, url: [] }, params: of({}), queryParams: of({}) } },
        { provide: JobService, useValue: { getJobById: () => of(null) } },
        { provide: JobPartService, useValue: { getJobPartsByJobId: () => of([]) } },
      ],
    }).overrideComponent(JobDetails, { set: { template: '' } }).compileComponents();
    fixture = TestBed.createComponent(JobDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });
  it('should create', () => expect(component).toBeTruthy());
});
