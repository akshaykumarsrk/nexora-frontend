import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobStatusChart } from './job-status-chart';

describe('JobStatusChart', () => {
  let component: JobStatusChart;
  let fixture: ComponentFixture<JobStatusChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobStatusChart],
    }).compileComponents();

    fixture = TestBed.createComponent(JobStatusChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
