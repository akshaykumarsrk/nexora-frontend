import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceRequestList } from './service-request-list';

describe('ServiceRequestList', () => {
  let component: ServiceRequestList;
  let fixture: ComponentFixture<ServiceRequestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceRequestList],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRequestList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
