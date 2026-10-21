import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Employee } from '../models/employee';
import { API_CONFIG } from '../../../core/config/api';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${API_CONFIG.baseUrl}/employees`

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // Why Omit<Employee, 'id'>?
  // Our form doesn't need the user to enter an id.
  // The database/backend would normally generate the ID.
  // Omit<Employee, 'id'> means: "Give me an Employee object, but without the id property."
  //   {
  //     employeeCode: 'EMP-1007',
  //     name: 'Akshay Kumar',
  //     email: 'akshay@nexora.com',
  //     department: 'Engineering',
  //     designation: 'Software Engineer',
  //     joiningDate: '2026-09-14',
  //     status: 'Active'
  //   }
  addEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(
      `${this.apiUrl}/${employee.id}`,
      employee
    );
  }
}