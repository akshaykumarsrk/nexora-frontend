import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee';

import { DialogModule } from 'primeng/dialog';
import { EmployeeFormDialog } from '../../components/employee-form-dialog/employee-form-dialog';
import { EmployeeDetailsDialog } from '../../components/employee-details-dialog/employee-details-dialog';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { forkJoin, finalize } from 'rxjs';

import { ApiError } from '../../../../core/models/api-error';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth';

@Component({
  imports: [
    ButtonModule,
    TableModule,
    SelectModule,
    FormsModule,
    DialogModule,
    EmployeeFormDialog,
    EmployeeDetailsDialog,
    ConfirmDialogModule,
    ToastModule
],
  providers: [ConfirmationService, MessageService],
  selector: 'app-employees',
  styleUrl: './employees.css',
  templateUrl: './employees.html',
})
export class Employees implements OnInit {

  private readonly employeesService = inject(EmployeeService);

  readonly authService = inject(AuthService);

  // ConfirmationService handles: "Are you sure?"
  private readonly confirmationService = inject(ConfirmationService);

  // MessageService handles: "Employee deleted successfully."
  private readonly messageService = inject(MessageService);

  readonly employees = signal<Employee[]>([]);

  readonly selectedEmployee = signal<Employee | null>(null);

  readonly selectedEmployees = signal<Employee[]>([]);

  readonly showDetailsDialog = signal(false);

  readonly statusOptions= [
    {label: 'All Statuses', value: null},
    {label: 'Active', value: 'Active'},
    {label: 'Inactive', value: 'Inactive'},
    {label: 'On Leave', value: 'On Leave'}
  ];

  readonly departmentOptions = [
    { label: 'All Departments', value: null },
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Human Resources', value: 'Human Resources' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Operations', value: 'Operations' }
  ];

  selectedDepartment: string | null = null;

  selectedStatus: string | null = null;

  readonly showEmployeeDialog = signal(false);

  readonly loading = signal(false);

  readonly saving = signal(false);

  readonly error = signal<string | null>(null);

  // means: "Angular, find the PrimeNG table with the name employeeTable and give me access to it in TypeScript."
  @ViewChild('employeeTable')
  employeeTable!: Table;

  @ViewChild(EmployeeFormDialog)
  employeeFormDialog!: EmployeeFormDialog;

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.error.set(null);

    this.employeesService.getEmployees().subscribe({
      next: (employess) => {
        this.employees.set(employess);
        this.loading.set(false);
      },

      error: (error) => {
        console.error('Error fetching employees:', error);

        this.loading.set(false);
        this.error.set('Unable to load employees. Please check whether the backend is running.');

        this.messageService.add({
          severity: 'error',
          summary: 'Unable to Load Employees',
          detail: 'Could not connect to the employee API.'
        });
      }
    });
  }

  onSearch(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.employeeTable.filterGlobal(input.value, 'contains');
  }

  onStatusChange(): void {
    if(this.selectedStatus) {
      // basically tells PrimeNG: "Look at the status field and show only rows whose status equals Active."
      // we used [(ngModel)]="selectedStatus" creates two-way binding, like user select Active then Angular changes selectedStatus = 'Active'
      // And if TypeScript changes selectedStatus, the dropdown also updates.
      // That's why the syntax has both: [ ] and ( ) together: [(ngModel)]
      // This is commonly called banana-in-a-box syntax 🍌📦.
      this.employeeTable.filter(
        this.selectedStatus,
        'status',
        'equals'
      );
    } else {
      this.employeeTable.filter(null, 'status', 'equals'); 
    }
  }

  // First parameter: this.selectedDepartment: Suppose User select 'Engineering'
  // Second parameter: 'department': This tells PrimeNG: Which property of the employee should I check?
  // Third parameter: 'equals': Only show employees where the department exactly equals the selected department.
  onDepartmentChange(): void {
    if(this.selectedDepartment) {
      this.employeeTable.filter(
        this.selectedDepartment,
        'department',
        'equals'
      );
    } else {
      this.employeeTable.filter(null, 'department', 'equals');
    }
  }

  openEmployeeDialog(): void {
    // we tell the form: "We're creating a new employee now. Give me a blank form."
    this.selectedEmployee.set(null);
    this.showEmployeeDialog.set(true);
  }

  closeEmployeeDialog(): void {
    this.showEmployeeDialog.set(false);
    this.selectedEmployee.set(null);
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog.set(false);
    this.selectedEmployee.set(null);
  }

  onEmployeeSaved(employee: Employee): void {

    this.saving.set(true);

    if(this.selectedEmployee()) {
      this.employeesService.updateEmployee(employee)
      .pipe(
        finalize(() => this.saving.set(false))
      )
      .subscribe({

        next: (updatedEmployee) => {

          this.messageService.add({
            severity: 'success',
            summary: 'Employee Updated',
            detail: `${updatedEmployee.name} has been updated successfully.`
          });

          this.closeEmployeeDialog();
          this.loadEmployees();
        },

        error: (error: HttpErrorResponse) => {

          console.error('Error updating employee:', error);

          this.handleEmployeeFormError(error);

          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Update Failed',
          //   detail: this.getApiErrorMessage(error)
          // });
        }
      });

    } else {

        const { id, ...newEmployee } = employee;
        this.employeesService.addEmployee(newEmployee)
        .pipe(
          // RxJS gives us finalize():
          // Run this code when the Observable finishes — whether it succeeds or fails.
          finalize(() => this.saving.set(false))
        )
        .subscribe({  
        next: (createdEmployee) => {

          this.messageService.add({
            severity: 'success',
            summary: 'Employee Added',
            detail: `${createdEmployee.name} has been added successfully.`
          });

          this.closeEmployeeDialog();
          this.loadEmployees();
        },

        error: (error: HttpErrorResponse) => {

          console.error('Error adding employee:', error);

          this.handleEmployeeFormError(error);

          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Add Failed',
          //   detail: this.getApiErrorMessage(error)
          // });
        }
      });
    }
  }

  editEmployee(employee: Employee): void {
    this.selectedEmployee.set(employee);
    this.showEmployeeDialog.set(true);
  }

  deleteEmployee(employee: Employee): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${employee.name}?`,
      header: 'Delete Employee',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.employeesService.deleteEmployee(employee.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Employee Deleted',
              detail: `${employee.name} has been deleted successfully.`
            });

            this.loadEmployees();
          },

          error: (error) => {
            console.error('Error deleting employee:', error);

            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: this.getApiErrorMessage(error)
            });
          }
        });
      }
    });
  }

  deleteSelectedEmployees(): void {
    const selected = this.selectedEmployees();

    if(selected.length === 0) {
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${selected.length} selected employees?`,
      header: 'Delete Selected Employees',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',

      accept: () => {
        const deleteRequests = selected.map(employee => this.employeesService.deleteEmployee(employee.id));

        // like we have 3 employees and then 2 HTTP requests created But these are Observables
        // forkJoin() takes all of them: and basically says:  "Start all these requests, and tell me when ALL of them have completed."
        // What if one fails? By default, forkJoin goes to: error: instead of next: That's exactly what we want for bulk deletion.
        forkJoin(deleteRequests).subscribe({
          next: () => {
            this.selectedEmployees.set([]);

            this.messageService.add({
              severity: 'success',
              summary: 'Employees Deleted',
              detail: `${selected.length} employees have been deleted successfully.`
            });

            this.loadEmployees();
          },

          error: (error) => {
            console.error('Error deleting employees:', error);

            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: this.getApiErrorMessage(error)
            });
          }
        });
      }
    });
  }

  viewEmployee(employee: Employee): void {
    this.selectedEmployee.set(employee);
    this.showDetailsDialog.set(true);
  }

  onDetailsDialogVisibleChange(visible: boolean): void {
    this.showDetailsDialog.set(visible);

    if(!visible) {
      this.selectedEmployee.set(null);
    }
  }

  clearSelection(): void {
    this.selectedEmployees.set([]);
  }

  private getApiErrorMessage(error: any): string {
    // Case 1: Backend sends:
    // { message: "Email already exists" }
    if (typeof error?.error?.message === 'string') {
      return error.error.message;
    }

    // Case 2: Backend sends:
    // { errors: { email: "Invalid email" } }
    if (error?.error?.errors) {

      const errors = error.error.errors;

      if (typeof errors === 'object') {
        return Object.values(errors) // convert json to array
          .flat() // makes it safe if some values are arrays.
          .join(' ');
      }
    }

    // Case 3: Backend sends a plain text error
    // Some backend might return: Some backend might return: instead of JSON
    if (typeof error?.error === 'string') {
      return error.error;
    }

    // Case 4: Angular itself provides a message
    // This handles an error generated by Angular/browser itself.
    if (typeof error?.message === 'string') {
      return error.message;
    }

    // Means: "I couldn't find a useful error message, so show a generic message."
    return 'Something went wrong. Please try again.';
  }


  // "Take whatever error came from the HTTP request and decide what we should do with it."
  // Why HttpErrorResponse? Because Angular gives your error callback an HttpErrorResponse.
  // ✅ HttpErrorResponse (Belongs to Angular.)
  //   ↓
  // "This is an Angular HTTP error."

  //       +

  // ✅ ApiError (Belongs to your NEXORA application.)
  //   ↓
  // "This is the JSON structure my backend sends."
  private handleEmployeeFormError(error: HttpErrorResponse): void {

    // Get the backend JSON
    // Suppose Spring Boot sends:
    // {
    //   "status": 400,
    //   "message": "Email already exists"
    // }
    // Angular receives something like:
    // HttpErrorResponse
    // │
    // └── error
    //      │
    //      ├── status: 400
    //      └── message: "Email already exists"
    // Therefore: error.error is your backend JSON.
    // as ApiError means: "Treat this backend JSON as an ApiError."
    // Now TypeScript understands:
    // apiError.status
    // apiError.message
    // apiError.errors
    const apiError = error.error as ApiError;

    // Case 1: Backend returned field-level validation errors
    // {
    //   "status": 400,
    //   "message": "Validation Failed",
    //   "errors": {
    //     "name": "Name is required",
    //     "email": "Invalid email format"
    //   }
    // }
    if(apiError.errors) {
      
      //   apiError.errors = {
      //    name: 'Name is required',
      //    email: 'Invalid email format'
      //  };
      // Object.entries() converts it into something like:
      // [
      //   ['name', 'Name is required'],
      //   ['email', 'Invalid email format']
      // ]
      // .forEach(): means: "Go through every error one by one."
      Object.entries(apiError.errors).forEach(([field, message]) => {

        // Send it to the form and add server error to Angular error
        // Why this weird as keyof typeof?
        // Object.entries() gives TypeScript a generic string for field.
        // But our setServerError() expects: keyof typeof this.employeeForm.controls
        this.employeeFormDialog.setServerError(
          field as keyof typeof this.employeeFormDialog.employeeForm.controls,
          message
        );
      });

      // After processing all field errors:
      // Show a general toast
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Failed',
        detail: 'Please correct the highlighted fields.'
      });

      return;

    }

    // Case 2: Backend return a general error
    // {
    //   "status": 400,
    //   "message": "Email already exists"
    // }
    if(apiError.message) {

      // Store the message
      const message = apiError.message;

      // Duplicate email
      // "Does this message contain the word email?"
      // So we know this error belongs to the Email field.
      if(message.toLowerCase().includes('email')) {

        this.employeeFormDialog.setServerError(
          'email',
          message
        );

        return;
      }

      // Duplicate employee code
      // "Does this message contain the word employee code?"
      // So we know this error belongs to the Employee Code field.
      if(message.toLowerCase().includes('employee code')) {

        this.employeeFormDialog.setServerError(
          'employeeCode',
          message
        );

        return;
      }

      // Other backend erros
      // {
      //   "status": 500,
      //   "message": "Database connection failed"
      // }
      this.messageService.add({
        severity: 'error',
        summary: 'Save Failed',
        detail: message
      });

      return;
    }

    // Case 3: Unknown error
    // If the backend sends something unexpected, the application still gives the user a meaningful message instead of crashing.
    this.messageService.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Something went wrong. Please try again.'
    });
  }

  exportEmployees(): void {

    // Get all employees
    // Because employees is a signal, we read its current value using: this.employees()
    // means: Give me the current employee array and store it in data.
    const data = this.employees();

    // Create CSV column names
    const headers = [
      'Employee Code',
      'Name',
      'Email',
      'Department',
      'Designation',
      'Joining Date',
      'Status'
    ];

    // Create CSV rows
    // map() means: Go through every employee and create something new from each employee.
    // So we're saying: From each employee, take only the fields we want in the exported file.
    // creates something like:
    // [
    //   [
    //     'EMP-1001',
    //     'Aarav Sharma',
    //     'aarav.sharma@nexora.com',
    //     'Engineering',
    //     'Senior Software Engineer',
    //     '2023-04-12',
    //     'Active'
    //   ],
    //   [
    //     'EMP-1002',
    //     'Priya Verma',
    //     'priya.verma@nexora.com',
    //     'Human Resources',
    //     'HR Manager',
    //     '2022-08-20',
    //     'Active'
    //   ]
    // ]

    // rows is still an array, not CSV text yet.
    const rows = data.map(employee => [
      employee.employeeCode,
      employee.name,
      employee.email,
      employee.department,
      employee.designation,
      employee.joiningDate,
      employee.status
    ]);

    // Combine headers and rows
    // The ... is the spread operator.
    // Without ... [headers, rows] would create:
    // [
    //   [headers],
    //   [row1, row2, row3]
    // ]
    // That's not what we want.
    // With ... [headers, ...rows] becomes:
    // [
    //   headers,
    //   row1,
    //   row2,
    //   row3
    // ]
    // So our CSV structure is now:
    // [
    //   [Employee Code, Name, Email, ...],
    //   [EMP-1001, Aarav, aarav@..., ...],
    //   [EMP-1002, Priya, priya@..., ...]
    // ]
    const csv = [
      headers,
      ...rows
    ]

      // Escape quotation marks: .replace(/"/g, '""')
      // Imagine an employee's name was: John "Johnny" Smith
      // CSV uses " to identify the beginning/end of a value
      // So we need to escape the quotation marks inside the actual data.
      // This: John "Johnny" Smith becomes: John ""Johnny"" Smith That's what .replace(/"/g, '""') does
      // /"/g means: Find every " character. and "" means: Replace it with two quotation marks.
      // So: 'John "Johnny" Smith' becomes: 'John ""Johnny"" Smith'
      // This prevents the CSV file from breaking
      .map(row =>  // Convert every row into text: needs to become: "EMP-1001","Aarav Sharma","aarav@nexora.com","Engineering"
      row  // Take every row and convert it into a CSV string.
        .map(value => `"${String(value).replace(/"/g, '""')}"`) // value represents each individual item: EMP-1001, Aarav Sharma: This guarantees that the value becomes a string.
        .join(',')
    )
    .join('\n');

    // Create a Blob
    // Blob means: Create a browser object containing some data that can behave like a file.
    // We're basically telling the browser: Take this CSV text and package it as file data.
    const blob = new Blob([csv], {
      // Tell the browser what type of file it is
      // This tells the browser: This data = CSV
      // charset=utf-8 tells it to use UTF-8 text encoding.
      type: 'text/csv;charset=utf-8;'
    });

    // Create a temporary URL
    // The browser has our file data in memory:
    // blob:http://localhost/abc123...
    // We can use this URL as the download source
    const url = URL.createObjectURL(blob);

    // Create an invisible link
    // We're creating an HTML <a> element using Javascript
    // We're creating one dynamically because we don't actually need to display a link on the page.
    const link = document.createElement('a'); 

    // Give the link our file URL
    // Remember url is the temporary URL pointing to our CSV Blob.
    // So: link -> href -> CSV data
    link.href = url;
    
    // Give the downloaded file a name
    // This tells the browser: When this link is downloaded, call the file employees.csv.
    link.download = 'employees.csv';

    // Trigger the download
    // This programmatically clicks our invisible link.
    // It's basically like the user doing:
    // Click Export
    //   ↓
    // Browser creates link
    //       ↓
    // JavaScript clicks link
    //       ↓
    // Download starts
    // That's why you don't see an actual <a> link on the page.
    link.click();

    // Remove the temporary URL from memory
    // After the download has been triggered, we don't need that URL anymore.
    URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Export Complete',
      detail: 'Employees have been exported successfully.'
    });

    // This export feature is actually teaching you some useful JavaScript:

    // .map()

    // ➡️ Transform every item.

    // ...rows

    // ➡️ Spread/unpack an array.

    // .join(',')

    // ➡️ Convert an array into a string using a separator.

    // new Blob()

    // ➡️ Package browser data as file-like data.
  }
}