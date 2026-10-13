import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstabModifPage } from './estab-modif.page';

describe('EstabModifPage', () => {
  let component: EstabModifPage;
  let fixture: ComponentFixture<EstabModifPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstabModifPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
