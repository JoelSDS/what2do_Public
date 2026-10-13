import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ToolbarService } from 'src/app/services/toolbar.service';
import { CategoryService } from 'src/app/services/category.service';
import { Router } from '@angular/router';
import { BackNavigationService } from 'src/app/services/back-navigation.service';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { EventPure } from 'src/app/models/event.model';
import { Category } from 'src/app/models/category.model';
import { AuthStorageService } from 'src/app/services/auth-storage.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.page.html',
  styleUrls: ['./create-event.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonCard,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
  ],
})
export class CreateEventPage implements OnInit {
  private fb = inject(FormBuilder);
  private toolbarService = inject(ToolbarService);
  private categoryService = inject(CategoryService);
  private authStorageService = inject(AuthStorageService);
  private eventService = inject(EventService);
  private router = inject(Router);
  private backNav = inject(BackNavigationService);

  idEstab: string = '';
  categories: Category[] = [];
  eventImages: string[] = [];

  eventForm = this.fb.group(
    {
      eve_nom: ['', Validators.required],
      eve_description: [''],
      eve_date_debut: ['', Validators.required],
      eve_date_fin: ['', Validators.required],
      eve_cat_id: ['', Validators.required],
      eve_images: [[] as string[]],
    },
    { validators: this.dateRangeValidator },
  );

  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('eve_date_debut')?.value;
    const end = group.get('eve_date_fin')?.value;

    if (!start || !end) {
      // On laisse les autres validators (comme 'required') gérer ce cas
      return null;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Retourne null si OK, ou un objet erreur sinon
    return endDate > startDate ? null : { dateRangeInvalid: true };
  }

  async ngOnInit() {
    const estabId = await this.authStorageService.getUserId();
    if (estabId) {
      this.idEstab = estabId;
    }
    addIcons({ closeCircle });
    this.loadCategories();
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
      console.error('Erreur récupération catégories', error);
    }
  }

  onImagesSelected(e: any) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.eventImages.push(reader.result as string);
        this.eventForm.patchValue({ eve_images: this.eventImages });
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number) {
    this.eventImages.splice(index, 1);
    this.eventForm.patchValue({ eve_images: this.eventImages });
  }

  async saveEvent() {
    if (this.eventForm.valid) {
      // Récupérer toutes les valeurs du formulaire
      const formValues = this.eventForm.value;
      // Créer ton objet Event typé
      const eventData: EventPure = {
        eve_nom: formValues.eve_nom ?? '',
        eve_description: formValues.eve_description ?? '',
        eve_date_debut: new Date(formValues.eve_date_debut as string),
        eve_date_fin: new Date(formValues.eve_date_fin as string),
        eve_cat_id: formValues.eve_cat_id ?? '',
        eve_images: formValues.eve_images ?? [],
        eve_eta_id: this.idEstab,
        eve_isActive: true,
      };
      const resp = await this.eventService.createEvent(eventData);
      this.backNav.goBack();
    }
  }

  cancel() {
    this.backNav.goBack();
  }
}
