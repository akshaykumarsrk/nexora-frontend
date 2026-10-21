import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { JobStatus } from '../../models/dashboard-response';

@Component({
  selector: 'app-job-status-chart',
  standalone: true,
  imports: [ChartModule],
  styleUrl: './job-status-chart.css',
  templateUrl: './job-status-chart.html',
})
export class JobStatusChart implements OnChanges {

  @Input() jobStatus: JobStatus[] = [];

  data: any = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };

  options: any = {
  maintainAspectRatio: false,

  responsive: true,

  plugins: {
    legend: {
      position: 'bottom',

      labels: {
        padding: 16,
        boxWidth: 32,
        usePointStyle: false
      }
    }
  },

  cutout: '55%'
};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobStatus']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
  this.data = {
    labels: this.jobStatus.map(
      item => this.formatStatus(item.status)
    ),

    datasets: [
      {
        data: this.jobStatus.map(
          item => item.count
        ),

        cutout: '55%'
      }
    ]
  };
}

  private formatStatus(status: string): string {
    return status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}