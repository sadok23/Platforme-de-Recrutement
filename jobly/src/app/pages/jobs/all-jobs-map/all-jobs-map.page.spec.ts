import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllJobsMapPage } from './all-jobs-map.page';

describe('AllJobsMapPage', () => {
  let component: AllJobsMapPage;
  let fixture: ComponentFixture<AllJobsMapPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AllJobsMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
