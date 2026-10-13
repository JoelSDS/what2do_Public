import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilUserPage } from './profil-user.page';

describe('ProfilUserPage', () => {
  let component: ProfilUserPage;
  let fixture: ComponentFixture<ProfilUserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
