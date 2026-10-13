import { Component, inject, Input, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/angular/standalone';
import { Establishment } from 'src/app/models/establishment.model';
import { Category } from 'src/app/models/category.model';
import { CategoryService } from 'src/app/services/category.service';
import { EstablishmentService } from 'src/app/services/establishment.service';
import { addIcons } from 'ionicons';
import { closeCircle, mailOutline } from 'ionicons/icons';
import { AuthStorageService } from 'src/app/services/auth-storage.service';
import { Router } from '@angular/router';
import { ToolbarService } from 'src/app/services/toolbar.service';
import { BackNavigationService } from 'src/app/services/back-navigation.service';

@Component({
  selector: 'app-estab-modif',
  templateUrl: './estab-modif.page.html',
  styleUrls: ['./estab-modif.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonIcon,
    IonCard,
    IonButton,
    IonInput,
    IonTextarea,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
  ],
})
export class EstabModifPage implements OnInit {
  private categoryService = inject(CategoryService);
  private establishmentService = inject(EstablishmentService);
  private authStorageService = inject(AuthStorageService);
  private toolbarService = inject(ToolbarService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private backNav = inject(BackNavigationService);

  readonly CurrentEstablishment = this.authStorageService.currentUser();
  updatedEstablishment: Establishment | null = null;
  categories: Category[] = [];

  establishmentForm = this.fb.group({
    eta_name: ['', Validators.required],
    eta_description: [''],
    eta_address: ['', Validators.required],
    eta_tel: ['', [Validators.pattern(/^[0-9+]*$/)]], // chiffres et +
    eta_opening_hours: ['', Validators.required],
    eta_cat_id: ['', Validators.required],
  });

  photosModif: string[] = [];

  ngOnInit() {
    addIcons({ closeCircle, mailOutline });
    this.loadCategories();

    const current = this.CurrentEstablishment as Establishment | null;
    if (current) {
      this.updatedEstablishment = { ...current };

      this.establishmentForm.patchValue({
        eta_name: current.eta_name || '',
        eta_description: current.eta_description || '',
        eta_address: current.eta_address || '',
        eta_tel: current.eta_tel || '',
        eta_opening_hours: current.eta_opening_hours || '',
        eta_cat_id: current.eta_cat_id || '',
      });
    }
  }

  ionViewWillEnter() {
    this.toolbarService.setBackButtonVisible(true);
    this.backNav.setFallbackPath('/tabs/profil-estab');
  }

  ngOnDestroy() {
    this.toolbarService.setBackButtonVisible(false);
  }

  loadCategories() {
    try {
      this.categories = this.categoryService.getCategories();
    } catch (error) {
      console.error('Erreur de récupération des catégories', error);
    }
  }

  onLogoSelected(e: any) {
    if (!this.updatedEstablishment) return;
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.updatedEstablishment!.eta_logo = reader.result as string;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeLogo() {
    if (!this.updatedEstablishment) return;
    this.updatedEstablishment.eta_logo = '';
  }

  onPhotosSelected(e: any) {
    if (!this.updatedEstablishment) return;
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    if (!Array.isArray(this.updatedEstablishment.eta_photos)) {
      this.updatedEstablishment.eta_photos = [];
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.updatedEstablishment!.eta_photos!.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  removePhoto(index: number) {
    if (!this.updatedEstablishment?.eta_photos) return;
    this.updatedEstablishment.eta_photos.splice(index, 1);
  }

  async saveChanges() {
    if (this.establishmentForm.valid) {
      const updated: Establishment = {
        ...this.updatedEstablishment, // garde ce qui existe déjà
        ...this.establishmentForm.value, // écrase par ce qui a été modifié
      } as Establishment;

      const resp: any =
        await this.establishmentService.updateEstablishment(updated);
      const newEstab = resp.data as Establishment;
      this.authStorageService.setCurrentUser(newEstab);
      const estab = this.authStorageService.currentUser();
      if (estab) {
        this.backNav.goBack();
      }
    }
  }

  cancelEdit() {
    const estab = this.authStorageService.currentUser();
    if (estab) {
      this.backNav.goBack();
    }
  }
}
