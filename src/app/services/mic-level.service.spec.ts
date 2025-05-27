import { TestBed } from '@angular/core/testing';

import { MicLevelService } from './mic-level.service';

describe('MicLevelService', () => {
  let service: MicLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MicLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
