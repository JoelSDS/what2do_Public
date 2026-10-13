import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilEstabPage } from './profil-estab.page';

describe('ProfilEstabPage', () => {
  let component: ProfilEstabPage;
  let fixture: ComponentFixture<ProfilEstabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilEstabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
