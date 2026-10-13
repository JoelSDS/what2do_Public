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
import { ActivatedRoute, Router } from '@angular/router';
import { BackNavigationService } from 'src/app/services/back-navigation.service';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { Category } from 'src/app/models/category.model';
import { EventService } from 'src/app/services/event.service';
import { AuthStorageService } from 'src/app/services/auth-storage.service';
import { EventPure } from 'src/app/models/event.model';
@Component({
  selector: 'app-modif-event',
  templateUrl: './modif-event.page.html',
  styleUrls: ['./modif-event.page.scss'],
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
export class ModifEventPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private categoryService = inject(CategoryService);
  private authStorageService = inject(AuthStorageService);
  private backNav = inject(BackNavigationService);
  private toolbarService = inject(ToolbarService);

  eventId: string = '';
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
    if (!start || !end) return null;
    return new Date(end) > new Date(start) ? null : { dateRangeInvalid: true };
  }

  async ngOnInit() {
    this.toolbarService.setBackButtonVisible(true);
    addIcons({ closeCircle });

    this.eventId = this.route.snapshot.paramMap.get('id') ?? '';
    this.idEstab = (await this.authStorageService.getUserId()) ?? '';
    this.loadCategories();

    if (this.eventId) {
      const event = await this.eventService.getEventById(this.eventId);
      if (event) {
        this.eventForm.patchValue({
          eve_nom: event.eve_nom,
          eve_description: event.eve_description,
          eve_date_debut: event.eve_date_debut?.toString().slice(0, 10),
          eve_date_fin: event.eve_date_fin?.toString().slice(0, 10),
          eve_cat_id: event.eve_cat_id,
          eve_images: event.eve_images ?? [],
        });
        this.eventImages = event.eve_images ?? [];
      }
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
      const formValues = this.eventForm.value;
      const updatedEvent: EventPure = {
        eve_nom: formValues.eve_nom ?? '',
        eve_description: formValues.eve_description ?? '',
        eve_date_debut: new Date(formValues.eve_date_debut as string),
        eve_date_fin: new Date(formValues.eve_date_fin as string),
        eve_cat_id: formValues.eve_cat_id ?? '',
        eve_images: formValues.eve_images ?? [],
        eve_eta_id: this.idEstab,
        eve_isActive: true,
      };

      await this.eventService.updateEvent(this.eventId, updatedEvent);
      this.backNav.goBack();
    }
  }

  cancel() {
    this.backNav.goBack();
  }
}
