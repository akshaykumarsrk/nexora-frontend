import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../environments/environment';

interface TechnicianJob {
  id: number;
  jobNumber: string;
  title: string;
  customerName: string;
  siteName: string;
  status: string;
  priority: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
}
interface TechnicianDashboardData {
  technicianName: string;
  totalAssignedJobs: number;
  activeJobs: number;
  completedJobs: number;
  scheduledJobs: number;
  completedJobBilledValue: number;
  jobs: TechnicianJob[];
}

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule],
  template: `
    <main class="tech-dashboard nx-page">
      <header class="page-head">
        <div><span class="eyebrow">TECHNICIAN WORKSPACE</span><h1>Welcome back, {{ data()?.technicianName || 'Technician' }}</h1><p>Track your assigned work, progress, and completed service jobs.</p></div>
        <p-button label="Refresh" icon="pi pi-refresh" [outlined]="true" (onClick)="load()" [loading]="loading()" />
      </header>

      @if (error()) { <div class="state error" role="alert">{{ error() }} <button type="button" (click)="load()">Try again</button></div> }
      @if (loading() && !data()) { <div class="state">Loading your technician workspace…</div> }
      @if (data(); as d) {
        <section class="stats" aria-label="My performance">
          <article class="stat"><span class="stat-icon pi pi-briefcase"></span><p>Total assigned jobs</p><strong>{{ d.totalAssignedJobs }}</strong><small>Jobs assigned to you</small></article>
          <article class="stat"><span class="stat-icon pi pi-sync"></span><p>In progress</p><strong>{{ d.activeJobs }}</strong><small>Work currently underway</small></article>
          <article class="stat"><span class="stat-icon pi pi-check-circle"></span><p>Completed jobs</p><strong>{{ d.completedJobs }}</strong><small>Successfully completed</small></article>
          <article class="stat"><span class="stat-icon pi pi-calendar"></span><p>Scheduled jobs</p><strong>{{ d.scheduledJobs }}</strong><small>Upcoming assignments</small></article>
        </section>
        <section class="billing-note"><i class="pi pi-chart-line"></i><div><strong>Completed-job billed value</strong><p>{{ d.completedJobBilledValue | currency:'INR':'symbol':'1.0-2':'en-IN' }} invoiced for your completed jobs. This is invoice value, not personal salary or commission.</p></div></section>
        <section class="jobs-panel nx-card">
          <div class="panel-head"><div><h2>My jobs</h2><p>Only jobs assigned to your technician account are shown here.</p></div><span class="job-count">{{ d.jobs.length }} jobs</span></div>
          @if (d.jobs.length) {
            <div class="job-list">
              @for (job of d.jobs; track job.id) {
                <article class="job-row">
                  <div class="job-symbol"><i class="pi pi-wrench"></i></div>
                  <div class="job-main"><div class="job-title-line"><strong>{{ job.title || job.jobNumber }}</strong><p-tag [value]="job.status" [severity]="severity(job.status)" /></div><span class="job-number">{{ job.jobNumber }}</span><div class="job-meta"><span><i class="pi pi-user"></i> {{ job.customerName }}</span><span><i class="pi pi-map-marker"></i> {{ job.siteName }}</span><span><i class="pi pi-calendar"></i> {{ job.scheduledAt ? (job.scheduledAt | date:'medium') : 'Not scheduled' }}</span></div><div class="job-actions"><a [routerLink]="['/job-cards']" [queryParams]="{jobId: job.id}">View job cards</a><a [routerLink]="['/job-cards/new']" [queryParams]="{jobId: job.id}">Create job card</a></div></div>
                </article>
              }
            </div>
          } @else {
            <div class="empty"><span class="pi pi-inbox"></span><h3>No jobs assigned yet</h3><p>When your manager assigns a job to your technician profile, it will appear here.</p></div>
          }
        </section>
      }
    </main>
  `,
  styles: [`
    :host{display:block;color:var(--nexora-text,#172033)}.tech-dashboard{max-width:1440px;margin:0 auto;padding:28px 30px 40px}.page-head{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:26px}.eyebrow{font-size:.72rem;letter-spacing:.13em;font-weight:800;color:var(--nexora-primary,#6366f1)}h1{font-size:clamp(1.7rem,3vw,2.25rem);margin:8px 0;font-weight:750;letter-spacing:-.035em} .page-head p,.panel-head p{margin:0;color:var(--nexora-text-muted,#64748b)}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.stat{position:relative;overflow:hidden;background:var(--nexora-surface,#fff);border:1px solid var(--nexora-border,#e2e8f0);border-radius:16px;padding:21px;box-shadow:var(--nexora-shadow-sm,0 2px 8px #1720330a)}.stat p{margin:12px 0 8px;color:var(--nexora-text-muted,#64748b);font-size:.9rem}.stat strong{display:block;font-size:2rem;line-height:1.2}.stat small{display:block;margin-top:8px;color:var(--nexora-text-muted,#64748b)}.stat-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--nexora-primary-soft,#eeedff);color:var(--nexora-primary,#6366f1);font-size:1.1rem}.billing-note{display:flex;align-items:flex-start;gap:14px;padding:18px 20px;margin:18px 0 24px;border:1px solid var(--nexora-border,#e2e8f0);border-radius:14px;background:var(--nexora-surface,#fff)}.billing-note>i{color:var(--nexora-primary,#6366f1);font-size:1.3rem;margin-top:3px}.billing-note p{margin:5px 0 0;color:var(--nexora-text-muted,#64748b);font-size:.9rem}.jobs-panel{padding:0;overflow:hidden}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 24px;border-bottom:1px solid var(--nexora-border,#e2e8f0)}.panel-head h2{margin:0 0 6px;font-size:1.15rem}.job-count{background:var(--nexora-primary-soft,#eeedff);color:var(--nexora-primary,#6366f1);padding:6px 10px;border-radius:99px;font-size:.8rem;font-weight:700}.job-row{display:flex;gap:14px;padding:20px 24px;border-bottom:1px solid var(--nexora-border,#e2e8f0);transition:background-color .18s ease,transform .18s ease}.job-row:last-child{border-bottom:0}.job-row:hover{background:var(--nexora-surface-hover,#f8faff)}.job-symbol{flex:0 0 42px;width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:var(--nexora-primary-soft,#eeedff);color:var(--nexora-primary,#6366f1)}.job-main{flex:1;min-width:0}.job-title-line{display:flex;align-items:center;justify-content:space-between;gap:12px}.job-title-line strong{font-weight:700}.job-number{display:block;margin-top:5px;font-size:.8rem;color:var(--nexora-primary,#6366f1);font-weight:700}.job-meta{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:12px;color:var(--nexora-text-muted,#64748b);font-size:.82rem}.job-meta i{margin-right:5px}.job-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.job-actions a{font-size:.82rem;font-weight:700;color:var(--nexora-primary,#6366f1);text-decoration:none;border:1px solid var(--nexora-border,#e2e8f0);border-radius:9px;padding:7px 10px}.job-actions a:hover{background:var(--nexora-primary-soft,#efefff)}.empty,.state{padding:48px 20px;text-align:center;color:var(--nexora-text-muted,#64748b)}.empty>span{font-size:2rem;color:var(--nexora-primary,#6366f1)}.empty h3{margin:12px 0 6px;color:var(--nexora-text,#172033)}.empty p{margin:0}.state.error{color:var(--nexora-danger,#b91c1c)}.state button{margin-left:8px;color:var(--nexora-primary,#6366f1);background:transparent;border:0;cursor:pointer}@media(max-width:1000px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.tech-dashboard{padding:20px 14px}.page-head{align-items:flex-start;flex-direction:column}.stats{grid-template-columns:1fr 1fr;gap:10px}.stat{padding:15px}.stat strong{font-size:1.6rem}.job-row{padding:16px 14px}.job-title-line{align-items:flex-start;flex-direction:column}.job-meta{flex-direction:column;gap:7px}}
  `]
})
export class TechnicianDashboardComponent {
  private readonly http = inject(HttpClient);
  readonly loading = signal(false);
  readonly data = signal<TechnicianDashboardData | null>(null);
  readonly error = signal('');
  private readonly url = `${environment.apiUrl}/dashboard/technician`;

  constructor() { this.load(); }
  load(): void {
    this.loading.set(true); this.error.set('');
    this.http.get<TechnicianDashboardData>(this.url).subscribe({
      next: value => { this.data.set(value); this.loading.set(false); },
      error: err => { this.loading.set(false); this.error.set(err?.error?.message ?? 'Could not load your technician dashboard. Please sign in again or contact your administrator.'); }
    });
  }
  severity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch ((status || '').toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'ON_HOLD': return 'warn';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  }
}
