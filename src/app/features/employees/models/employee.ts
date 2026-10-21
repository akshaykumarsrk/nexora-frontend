export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  avatar?: string;
}