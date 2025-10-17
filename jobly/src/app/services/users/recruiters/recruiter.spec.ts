import { TestBed } from '@angular/core/testing';

import { Recruiter } from './recruiter';

describe('Recruiter', () => {
  let service: Recruiter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recruiter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
