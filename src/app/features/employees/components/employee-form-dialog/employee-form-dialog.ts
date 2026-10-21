import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Employee } from '../../models/employee';


@Component({
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
  selector: 'app-employee-form-dialog',
  styleUrl: './employee-form-dialog.css',
  templateUrl: './employee-form-dialog.html',
})
export class EmployeeFormDialog implements OnChanges, OnInit {

  // Why @input?
  // The parent (EmployeesComponent) will send the selected employee to the form:
  //  Employees Page
  //      │
  //      │ [employee]="selectedEmployee()"
  //      ↓
  // Employee Form
  @Input()
  employee: Employee | null = null;

  @Input()
  saving = false;

  // This allows the child component to communicate with its parent.
  // means: "I'm telling the parent that Save happened and here is the employee data."
  // status can ONLY be one of these 3 values. Active, Inactive, On Leave
  // This is called a union type.
  // means: I have created a messenger called saved, and it can carry EmployeeFormData."
  @Output()
  saved = new EventEmitter<Employee>();

  @Output()
  cancelled = new EventEmitter<void>();

  // Using Constructor you have to create form in a method while using inject create form without method
  // constructor(private readonly fb: FormBuilder) {}

  // readonly employeeForm = this.createForm();

  // private createForm() {
  //     return this.fb.nonNullable.group({
  //     name: ['', Validators.required],
  //     email: ['', [Validators.required, Validators.email]],
  //     employeeCode: ['', Validators.required],
  //     department: ['', Validators.required],
  //     designation: ['', Validators.required],
  //     joiningDate: ['', Validators.required],
  //     status: ['Active' as 'Active' | 'Inactive' | 'On Leave', Validators.required]
  //   });
  // }

  // Using inject you can create form without method
  private readonly fb = inject(FormBuilder);

  readonly employeeForm = this.fb.nonNullable.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      employeeCode: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      joiningDate: ['', Validators.required],
      status: ['Active' as 'Active' | 'Inactive' | 'On Leave', Validators.required]
    });

  // Think of it as a form factory 🏭.
  // Instead of manually creating every control, we say: this.fb.nonNullable.group({})
  // and Angular builds the form for us.
  // We're creating one form called: employeeForm
  // 'Active' as 'Active' | 'Inactive' | 'On Leave'
  // We're basically saying: "Hey TypeScript, don't treat this as any random string. This belongs to these three allowed values."

  // private createForm() {
  //     return this.fb.nonNullable.group({
  //     name: ['', Validators.required],
  //     email: ['', [Validators.required, Validators.email]],
  //     employeeCode: ['', Validators.required],
  //     department: ['', Validators.required],
  //     designation: ['', Validators.required],
  //     joiningDate: ['', Validators.required],
  //     status: ['Active' as 'Active' | 'Inactive' | 'On Leave', Validators.required]
  //   });
  // }

  readonly statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'On Leave', value: 'On Leave' }
  ];

  ngOnInit(): void {
    this.setupServerErrorClearing();
  }

  // ❌ Add Failed: Email already exists: That's already error handling.
  // So why are we doing setServerError()? Because a toaster tells the user: "Something went wrong."
  // But it doesn't tell Angular: "The EMAIL field is the field that has the problem."
  // Toast = Tell the user about the error
  // setServerError() = Attach the error to the correct form field
  setServerError(
    field: 'name' | 'email' | 'employeeCode' | 'department' | 'designation' | 'joiningDate' | 'status',
    message: string
  ): void {

    // control means: "Give me the particular form field that the caller asked for."
    // Let's say we call: field = 'email' So this becomes: this.employeeForm.controls.email
    const control = this.employeeForm.controls[field];

    // This is the heart of the feature.
    // Angular's FormControl has a place where it stores errors: which is control.errors
    // for example { email: true } or { required: true } but we want to add our own error: which is server: message
    // What is server? We created this ourselves. Angular already has things like: required, email, minlength, maxlength
    // But Angular doesn't know: Email already exists because Angular doesn't have access to your MySQL database.
    // Your backend knows that. So we create our own error key: server
    // What does ...control.errors mean? Suppose your email already has: { email: true } We don't want to destroy that.
    // We want: { email: true, server: 'Email already exists' } 
    // So: ...control.errors means: "Keep all the errors that are already there."
    // Then: server: message means: "Add my backend error."

    // So: thw whole means: "Keep the existing errors and add the backend error."
    control.setErrors({
      ...control.errors,
      server: message
    });

    // markAllAsTouched() is a method you normally use on the FormGroup to mark every control as touched.
    control.markAllAsTouched();
  }

  // When the user clicks Save, we'll eventually call: onSubmit()
  onSubmit(): void {

    // Angular checks: "Are all the fields valid?"
    // If not then This tells Angular: "Show the validation errors for all fields."
    if(this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    // getrawValue() gives us something like:
    // {
    //   name: 'Rahul Sharma',
    //   email: 'rahul@gmail.com',
    //   employeeCode: 'EMP-1007',
    //   department: 'Engineering',
    //   designation: 'Software Engineer',
    //   joiningDate: '2026-09-13',
    //   status: 'Active'
    // }
  
    const formData = this.employeeForm.getRawValue();

    const employee: Employee = {
      id: this.employee?.id ?? 0,
      ...formData
    };

    console.log('FORM DATA:', formData);
    console.log('EMPLOYEE SENT TO PARENT:', employee);

    // we are basically saying: "Hey parent! I saved the employee!" 📢
    // .emit() means: "Send the message!" 📢
    // What is $event?
    // $event is the thing the child sent.
    // The parent receives that object as: $event
    this.saved.emit(employee);
    this.employeeForm.reset({
      name: '',
      email: '',
      employeeCode: '',
      department: '',
      designation: '',
      joiningDate: '',
      status: 'Active'
    });
  }

// What does patchValue() do?
// Suppose we click Edit on:
// Rohan Mehta
// Finance
// Financial Analyst
// The parent sends the employee:
//           Employees Page
//               │
//               │ employee
//               ↓
//     EmployeeFormDialog
//               │
//               ↓
//         patchValue()
//               │
//        ┌──────┴──────┐
//        ↓             ↓
//     Name          Department
//  Rohan Mehta       Finance

// So the form automatically becomes filled.

  ngOnChanges(changes: SimpleChanges): void {

    if(!changes['employee']) {
      return;
    }

    if(this.employee) {
      // EDIT mode → fill the form
      this.employeeForm.patchValue({
        name: this.employee.name,
        email: this.employee.email,
        employeeCode: this.employee.employeeCode,
        department: this.employee.department,
        designation: this.employee.designation,
        joiningDate: this.employee.joiningDate,
        status: this.employee.status
      });
    } else {
      // ADD mode → clear the form
      this.employeeForm.reset({
        name: '',
        email: '',
        employeeCode: '',
        department: '',
        designation: '',
        joiningDate: '',
        status: 'Active'
      });
    }
  }

  // Add this getter inside the component:
  // So:
  //   employee = null
  //       ↓
  //    ADD mode

  // employee = existing employee
  //       ↓
  //    EDIT mode
  get isEditMode(): boolean {
    return this.employee !== null;
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  // Its job is: Remove the error that came from the backend.
  // Remember, earlier we created our custom error: server: message
  // So clearServerError() removes that server error.
  // "field must be the name of one of my form controls." like name, email, employeeCode, department
  // why use that? because it gives us type safety instead of field: string so Only fields that actually exist in this form are allowed.
  // this.employeeForm.controls: This is an object containing your controls:
  // typeof this.employeeForm.controls: means "TypeScript, tell me the type/shape of this controls object."
  // keyof typeof this.employeeForm.controls: means "Now give me the names/keys of that controls object."
  // so instead of manually writing: field: 'name' | 'email' | 'employeeCode' | ...
  // we can write: field: keyof typeof this.employeeForm.controls
  // So it is basically saying: "field must be one of the actual fields that exist in my form."
  private clearServerError(field: keyof typeof this.employeeForm.controls): void {

    // suppose: field = 'email' so that becomes: this.employeeForm.controls.email
    // Now control represents the Email field who has email formControl.
    const control = this.employeeForm.controls[field];

    // This means: "If errors exist, give me the server error."
    // The ?. is optional chaining. why here because sometimes: control.errors is null
    // If there are no errors, we don't want the code to crash.
    // In simple words: If there is nothing to remove, stop.
    if(!control.errors?.['server'])
        return;

    // We're making a copy of all existing errors.
    // Why copy it? Because we want to remove only: server and keep everything else.
    const errors = { ...control.errors };

    // This removes the backend error.
    // Before:
    // {
    //   email: true,
    //   server: 'Email already exists'
    // }
    // After:
    // {
    //   email: true
    // }
    // We haven't touched the Angular email error.
    // We only removed our custom: server error.
    delete errors['server'];

    // This tells Angular: "These are the errors that this field currently has."
    control.setErrors(
      Object.keys(errors).length > 0 ? errors : null
    );
  }

  // Its purpose is very simple: When the user changes a field, remove the old backend error from that field.
  // Like User enters: akshay121817@gmail.com and Backend says: ❌ Email already exists so Now user changes it to srk@gmail.com
  // so We don;t want this old message to remain: because user has already changed to new fresh email
  // When the user changes it:
  //   value changes
  //       ↓
  // clearServerError()
  //       ↓
  // remove server error
  private setupServerErrorClearing(): void {

    // Object.keys() gives us their names:
    // So we're basically saying: "Give me the names of all fields in my form."
    Object.keys(this.employeeForm.controls).forEach((field) => {

      // Why as keyof? This is a TypeScript issue. that Object.keys() generally gives TypeScript a: string[]
      // So TypeScript thinks: field could be any string: "email", "banana", "xyz"
      // But your form controls only accept: name, email, employeeCode, department, designation, joiningDate, status
      // So: field as keyof typeof this.employeeForm.controls tells TypeScript:  "Trust me. This field is one of the keys of my form controls."
      // It's called a type assertion.
      const control = this.employeeForm.controls[
        field as keyof typeof this.employeeForm.controls
      ];

      // valueChanges means: "Tell me whenever the value of this field changes."
      // Every time the user changes the value, the subscription runs.
      // Suppose we're currently watching: email and User changes email Then we effectively call:"
      // this.clearServerError('email'); That method removes: server: 'Email already exists'
      control.valueChanges.subscribe(() => {
        this.clearServerError(
          field as keyof typeof this.employeeForm.controls
        );
      });
    });
  }
}

