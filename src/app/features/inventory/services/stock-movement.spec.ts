import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StockMovementService } from './stock-movement';

describe('StockMovementService', () => {
  let service: StockMovementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(StockMovementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
