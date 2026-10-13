import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstablishmentDetailsPage } from './establishment-details.page';

describe('EstablishmentDetailsPage', () => {
  let component: EstablishmentDetailsPage;
  let fixture: ComponentFixture<EstablishmentDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstablishmentDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
