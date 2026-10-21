import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { StatCardComponent } from '../../components/stat-card/stat-card-component';
import { RecentActivity } from '../../components/recent-activity/recent-activity';
import { RevenueChart } from '../../components/revenue-chart/revenue-chart';
import { JobStatusChart } from '../../components/job-status-chart/job-status-chart';

import { Dashboard } from '../../services/dashboard-service';
import {
  DashboardResponse
} from '../../models/dashboard-response';

type DashboardStatus = 'loading' | 'success' | 'error';

interface DashboardState {
  status: DashboardStatus;
  data: DashboardResponse | null;
}

interface StatCard {
  title: string;
  value: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',

  imports: [
    StatCardComponent,
    ButtonModule,
    SkeletonModule,
    ToastModule,
    RecentActivity,
    RevenueChart,
    JobStatusChart
  ],

  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {

  readonly dashboardState = signal<DashboardState>({
    status: 'loading',
    data: null,
  });

  readonly statCards = signal<StatCard[]>([]);


  constructor(
    private readonly dashboardService: Dashboard,
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}


  ngOnInit(): void {
    if (this.authService.hasRole('TECHNICIAN')) {
      void this.router.navigateByUrl('/technician-dashboard', { replaceUrl: true });
      return;
    }
    this.loadDashboard();
  }


  loadDashboard(): void {

    this.dashboardState.set({
      status: 'loading',
      data: null,
    });

    this.dashboardService.getDashboard().subscribe({

      next: (data: DashboardResponse) => {

        this.dashboardState.set({
          status: 'success',
          data
        });

        this.createStatCards(data);

        this.messageService.add({
          severity: 'success',
          summary: 'Dashboard Updated',
          detail: 'Latest dashboard data loaded successfully.',
          life: 3000
        });
      },


      error: (error) => {

        console.error(
          'Error fetching dashboard summary:',
          error
        );

        this.dashboardState.set({
          status: 'error',
          data: null
        });

        this.statCards.set([]);

        this.messageService.add({
          severity: 'error',
          summary: 'Loading Failed',
          detail: 'Unable to load dashboard data.',
          life: 5000
        });
      }
    });
  }


  private createStatCards(
    data: DashboardResponse
  ): void {

    const summary = data.summary;

    this.statCards.set([
    {
      title: 'Total Customers',
      value: data.summary.totalCustomers.toLocaleString(),
      icon: 'pi pi-users',
      description: 'Customers in your organization'
    },
    {
      title: 'Total Sites',
      value: data.summary.totalSites.toLocaleString(),
      icon: 'pi pi-map-marker',
      description: 'Registered customer sites'
    },
    {
      title: 'Total Assets',
      value: data.summary.totalAssets.toLocaleString(),
      icon: 'pi pi-box',
      description: 'Assets under management'
    },
    {
      title: 'Pending Requests',
      value: data.summary.pendingServiceRequests.toLocaleString(),
      icon: 'pi pi-inbox',
      description: 'Service requests awaiting action'
    },
    {
      title: 'Active Jobs',
      value: data.summary.activeJobs.toLocaleString(),
      icon: 'pi pi-cog',
      description: 'Jobs currently in progress'
    },
    {
      title: 'Completed Jobs',
      value: data.summary.completedJobs.toLocaleString(),
      icon: 'pi pi-check-circle',
      description: 'Successfully completed jobs'
    },
    {
      title: 'Total Revenue',
      value: this.formatCurrency(data.summary.totalRevenue),
      icon: 'pi pi-wallet',
      description: 'Total invoice revenue'
    },
    {
      title: 'Pending Payments',
      value: this.formatCurrency(data.summary.pendingPayments),
      icon: 'pi pi-credit-card',
      description: 'Payments awaiting collection'
    }
  ]);
  }


  private formatCurrency(
    value: number
  ): string {

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }
}