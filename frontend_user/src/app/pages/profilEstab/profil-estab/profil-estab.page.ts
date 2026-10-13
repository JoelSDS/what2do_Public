import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRow,
} from '@ionic/angular/standalone';
import { EstablishmentService } from 'src/app/services/establishment.service';
import { Establishment } from 'src/app/models/establishment.model';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  callOutline,
  createOutline,
  locationOutline,
  mailOutline,
  trashOutline,
} from 'ionicons/icons';
import { CategoryService } from 'src/app/services/category.service';
import { AuthStorageService } from 'src/app/services/auth-storage.service';
import { User } from 'src/app/models/user.model';
import { RouterOutlet } from '@angular/router';
import { EventService } from 'src/app/services/event.service';

import { EventCardComponent } from '../../../components/event-card/event-card.component';
import { Event } from 'src/app/models/event.model';
import { AlertController } from '@ionic/angular';
// Type pour mises à jour partielles
type EstablishmentPatch = Partial<Establishment>;

@Component({
  selector: 'app-profil-estab',
  templateUrl: './profil-estab.page.html',
  styleUrls: ['./profil-estab.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardTitle,
    IonCardHeader,
    IonCardContent,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    EventCardComponent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class ProfilEstabPage implements OnInit {
  private categoryService = inject(CategoryService);
  private authStorageService = inject(AuthStorageService);
  private eventService = inject(EventService);
  private alertController = inject(AlertController);
  private router = inject(Router);
  readonly establishment = this.authStorageService.currentUser;
  eventsList: Event[] = [];
  page = 0;
  limit = 10;
  isLoading = false;

  constructor() {}

  ngOnInit() {
    addIcons({
      createOutline,
      locationOutline,
      callOutline,
      mailOutline,
      addCircleOutline,
      trashOutline,
    });
    this.loadEventsEstablishment();
  }

  async ionViewWillEnter() {
    this.loadEventsEstablishment();
  }

  async loadEventsEstablishment(e?: any) {
    if (this.isLoading) return; // évite les appels multiples
    this.isLoading = true;
    try {
      const estabId = this.establishment()?.id;
      if (!estabId) return;
      const events = await this.eventService.getEstablishmentEvents(
        this.page,
        this.limit,
        estabId,
      );
      if (events) {
        if (this.page === 0) this.eventsList = [];
        this.eventsList.push(...events);
      }
      if (e) e.target.complete();
    } catch (error) {
      console.error('Erreur de récupération des établissements', error);
      if (e) e.target.complete();
    } finally {
      this.isLoading = false;
    }
  }

  private isEstablishment(
    obj: User | Establishment | null | undefined,
  ): obj is Establishment {
    return !!obj && 'eta_mail' in obj;
  }

  get establishmentAsEstab(): Establishment | null {
    const e = this.establishment();
    return this.isEstablishment(e) ? e : null;
  }

  onEditProfile() {
    this.router.navigate(['tabs/profil-estab/estab-modif']);
  }

  getCategoryName(catId: string) {
    const cat = this.categoryService.getCatNameById(catId);
    return cat ?? 'Inconnue';
  }
  getCategoryCode(catId: string) {
    const cat = this.categoryService.getCatCodeById(catId);
    return `assets/categoriesIcons/${cat}.png`;
  }

  // Infinite scroll
  loadMore(event: any) {
    this.page++;
    this.loadEventsEstablishment(event).then(() => {
      if (this.eventsList.length < this.page * this.limit) {
        event.target.disabled = true; // plus rien à charger
      }
    });
  }

  onEditEvent(eventId: string) {
    if (!eventId) return;

    this.router.navigate(['tabs/profil-estab/modif-event', eventId]);
  }

  async onDeleteEvent(eventId: string) {
    if (!eventId) return;

    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Souhaitez-vous vraiment désactiver cet événement ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Confirmer',
          handler: async () => {
            try {
              const deletedEvent =
                await this.eventService.softDeleteEvent(eventId);
              if (deletedEvent) {
                this.eventsList = this.eventsList.filter(
                  (event) => event.id !== eventId,
                );
              } else {
                console.warn('La désactivation a échoué');
              }
            } catch (error) {
              console.error('Erreur lors de la suppression', error);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  addNewEvent() {
    this.router.navigate(['tabs/profil-estab/create-event']);
  }
}
