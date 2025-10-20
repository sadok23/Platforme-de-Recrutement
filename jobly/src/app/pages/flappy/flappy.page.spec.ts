import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlappyPage } from './flappy.page';

describe('FlappyPage', () => {
  let component: FlappyPage;
  let fixture: ComponentFixture<FlappyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FlappyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
