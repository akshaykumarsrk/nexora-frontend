import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Employees } from './employees';
import { EmployeeService } from '../../services/employee';
import { AuthService } from '../../../../core/services/auth';

describe('Employees', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Employees],
      providers: [
        { provide: EmployeeService, useValue: { getEmployees: () => of([]) } },
        { provide: AuthService, useValue: { getToken: () => null, getRole: () => null, hasRole: () => false, isAdmin: () => false } },
      ],
    }).overrideComponent(Employees, { set: { template: '' } }).compileComponents();
    fixture = TestBed.createComponent(Employees);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });
  it('should create', () => expect(component).toBeTruthy());
});
