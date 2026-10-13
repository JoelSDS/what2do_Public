import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabEstablishmentsPage } from './tab-establishments.page';

describe('TabEstablishmentsPage', () => {
  let component: TabEstablishmentsPage;
  let fixture: ComponentFixture<TabEstablishmentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabEstablishmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
