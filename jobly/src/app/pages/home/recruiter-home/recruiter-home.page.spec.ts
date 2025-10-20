import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecruiterHomePage } from './recruiter-home.page';

describe('RecruiterHomePage', () => {
  let component: RecruiterHomePage;
  let fixture: ComponentFixture<RecruiterHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecruiterHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
