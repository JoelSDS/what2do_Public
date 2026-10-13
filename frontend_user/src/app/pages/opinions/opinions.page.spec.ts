import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpinionsPage } from './opinions.page';

describe('OpinionsPage', () => {
  let component: OpinionsPage;
  let fixture: ComponentFixture<OpinionsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OpinionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
