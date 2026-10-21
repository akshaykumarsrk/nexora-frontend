import { API_CONFIG } from './api';

describe('API_CONFIG', () => {
  it('should expose the configured API base URL', () => {
    expect(API_CONFIG.baseUrl).toBeTruthy();
  });
});