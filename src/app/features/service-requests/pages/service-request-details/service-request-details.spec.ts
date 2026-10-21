import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceRequestDetails } from './service-request-details';

describe('ServiceRequestDetails', () => {
  let component: ServiceRequestDetails;
  let fixture: ComponentFixture<ServiceRequestDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceRequestDetails],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}), params: {}, queryParams: {} }, params: of({}), queryParams: of({}) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRequestDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
