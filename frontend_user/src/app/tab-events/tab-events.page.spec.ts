import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabEventsPage } from './tab-events.page';

describe('TabEventsPage', () => {
  let component: TabEventsPage;
  let fixture: ComponentFixture<TabEventsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabEventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
