import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobCardList } from './job-card-list';

describe('JobCardList', () => {
  let component: JobCardList;
  let fixture: ComponentFixture<JobCardList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCardList],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
