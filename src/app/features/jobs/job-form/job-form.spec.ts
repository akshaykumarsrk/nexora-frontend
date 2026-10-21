import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { JobForm } from './job-form';
import { JobService } from '../../../features/jobs/services/job';
import { ServiceRequestService } from '../../../features/service-requests/services/service-request';
import { SiteService } from '../../../features/sites/services/sites';
import { TechnicianService } from '../../../features/technicians/services/technician';

describe('JobForm', () => {
  let component: JobForm;
  let fixture: ComponentFixture<JobForm>;
  beforeEach(async () => {
    const route = { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}), params: {}, queryParams: {}, url: [] }, parent: null, params: of({}), queryParams: of({}) };
    await TestBed.configureTestingModule({
      imports: [JobForm],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: route }, MessageService,
        { provide: JobService, useValue: { getJobById: () => of(null), getAllJobs: () => of([]) } },
        { provide: ServiceRequestService, useValue: { getAllServiceRequests: () => of([]), getServiceRequests: () => of([]) } },
        { provide: SiteService, useValue: { getAllSites: () => of([]), getSites: () => of([]), getSitesByCustomer: () => of([]) } },
        { provide: TechnicianService, useValue: { getAllTechnicians: () => of([]), getTechnicians: () => of([]) } },
      ],
    }).overrideComponent(JobForm, { set: { template: '' } }).compileComponents();
    fixture = TestBed.createComponent(JobForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });
  it('should create', () => expect(component).toBeTruthy());
});
