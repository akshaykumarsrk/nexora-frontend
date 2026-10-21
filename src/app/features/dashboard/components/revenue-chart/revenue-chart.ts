import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';

import { Revenue } from '../../models/dashboard-response';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [ChartModule],
  styleUrl: './revenue-chart.css',
  templateUrl: './revenue-chart.html',
})
export class RevenueChart implements OnChanges {

  @Input() revenue: Revenue[] = [];

  data: any = {
    labels: [],
    datasets: [
      {
        label: 'Revenue',
        data: [],
        fill: true,
        tension: 0.4,
      },
    ],
  };

  options: any = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Revenue: ${this.formatCurrency(context.raw)}`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          maxRotation: 0,
          autoSkip: true,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          callback: (value: number) => {
            return this.formatCurrency(value);
          },
        },

        grid: {
          color: '#e2e8f0',
        },
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['revenue']) {
      this.updateChart();
    }
  }

  private updateChart(): void {

    const sortedRevenue = [...this.revenue].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    this.data = {
      labels: sortedRevenue.map(item =>
        this.formatDate(item.date)
      ),

      datasets: [
        {
          label: 'Revenue',

          data: sortedRevenue.map(item =>
            item.amount
          ),

          fill: true,
          tension: 0.4,
        },
      ],
    };
  }

  private formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(date));
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }
}