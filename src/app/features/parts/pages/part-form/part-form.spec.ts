import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartForm } from './part-form';

describe('PartForm', () => {
  let component: PartForm;
  let fixture: ComponentFixture<PartForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartForm],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}), params: {}, queryParams: {} }, params: of({}), queryParams: of({}) } }, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(PartForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
