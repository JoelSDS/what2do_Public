import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModifEventPage } from './modif-event.page';

describe('ModifEventPage', () => {
  let component: ModifEventPage;
  let fixture: ComponentFixture<ModifEventPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifEventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
