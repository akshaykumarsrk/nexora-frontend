import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartDetails } from './part-details';

describe('PartDetails', () => {
  let component: PartDetails;
  let fixture: ComponentFixture<PartDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartDetails],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}), params: {}, queryParams: {} }, params: of({}), queryParams: of({}) } }, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(PartDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
