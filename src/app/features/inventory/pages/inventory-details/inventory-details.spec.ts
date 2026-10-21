import { vi } from 'vitest';
import { of } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryDetails } from './inventory-details';

describe('InventoryDetails', () => {
  let component: InventoryDetails;
  let fixture: ComponentFixture<InventoryDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryDetails],
      providers: [{ provide: Router, useValue: { navigate: vi.fn() } }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}), params: {}, queryParams: {} }, params: of({}), queryParams: of({}) } }, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
