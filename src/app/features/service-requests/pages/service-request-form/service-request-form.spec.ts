import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceRequestForm } from './service-request-form';

describe('ServiceRequestForm', () => {
  let component: ServiceRequestForm;
  let fixture: ComponentFixture<ServiceRequestForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceRequestForm],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}), params: {}, queryParams: {} }, params: of({}), queryParams: of({}) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRequestForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
