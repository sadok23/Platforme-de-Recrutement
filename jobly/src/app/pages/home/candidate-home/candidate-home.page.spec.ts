import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidateHomePage } from './candidate-home.page';

describe('CandidateHomePage', () => {
  let component: CandidateHomePage;
  let fixture: ComponentFixture<CandidateHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
