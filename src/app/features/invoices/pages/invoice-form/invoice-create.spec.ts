import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { InvoiceCreate } from './invoice-create';

describe('InvoiceCreate', () => {
  let component: InvoiceCreate;
  let fixture: ComponentFixture<InvoiceCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceCreate],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
