import { vi } from 'vitest';
import { of } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiteDetails } from './site-details';

describe('SiteDetails', () => {
  let component: SiteDetails;
  let fixture: ComponentFixture<SiteDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteDetails],
      providers: [{ provide: Router, useValue: { navigate: vi.fn() } }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}), params: {}, queryParams: {} }, params: of({}), queryParams: of({}) } }, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
