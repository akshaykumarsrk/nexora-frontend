import { Component, Input, signal } from '@angular/core';
import { Employee } from '../../models/employee';

@Component({
  imports: [],
  selector: 'app-employee-details-dialog',
  styleUrl: './employee-details-dialog.css',
  templateUrl: './employee-details-dialog.html',
})
export class EmployeeDetailsDialog {

  @Input()
  employee: Employee | null = null;

  readonly selectedEmployee = signal<Employee | null>(null);

  readonly showDetailsDialog = signal(false);

}
