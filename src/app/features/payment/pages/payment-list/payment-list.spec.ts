import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentList } from './payment-list';

describe('PaymentList', () => {
  let component: PaymentList;
  let fixture: ComponentFixture<PaymentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentList],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}), params: {}, queryParams: {} }, params: of({}), queryParams: of({}) } }, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
