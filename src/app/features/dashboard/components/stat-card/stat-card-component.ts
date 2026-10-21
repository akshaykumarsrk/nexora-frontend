import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-stat-card',
  styleUrl: './stat-card-component.css',
  templateUrl: './stat-card-component.html',
})
export class StatCardComponent {

  // input() Instead of hardcoding: Revenue ₹12.4L 12.5% inside the component, the parent will provide the data.
  // it only says: "Whoever uses me must give me these values."
  // Dashboard
  //    │
  //    │ gives data
  //    ↓
  // StatCard
  readonly title = input.required<string>();     // 📦 waiting for data and "The parent MUST provide a title."
  readonly value = input.required<string>();    // 📦 waiting for data and "The parent MUST provide a value."
  readonly icon = input<string>('pi pi-chart-bar');   // 📦 waiting for data and "The parent MUST provide a icon."
  readonly description = input<string>('');
}
