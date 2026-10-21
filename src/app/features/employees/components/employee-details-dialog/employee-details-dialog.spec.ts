import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeDetailsDialog } from './employee-details-dialog';

describe('EmployeeDetailsDialog', () => {
  let component: EmployeeDetailsDialog;
  let fixture: ComponentFixture<EmployeeDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDetailsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
