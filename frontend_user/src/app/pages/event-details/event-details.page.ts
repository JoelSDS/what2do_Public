import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonBadge,
  IonAvatar,
  IonImg,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { EventService } from 'src/app/services/event.service';
import { addIcons } from 'ionicons';
import { calendarOutline, locationOutline } from 'ionicons/icons';
import { Event } from 'src/app/models/event.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToolbarService } from 'src/app/services/toolbar.service';
import { BackNavigationService } from 'src/app/services/back-navigation.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButtons,
    IonBadge,
    IonAvatar,
    IonImg,
    IonSpinner,
    IonIcon,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EventDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private toolbarService = inject(ToolbarService);
  private backNav = inject(BackNavigationService);

  event!: Event | null;
  isPast = false;
  isOngoing = false;
  statusLabel = '';

  ngOnInit() {
    //this.toolbarService.setBackButtonVisible(true);
    addIcons({ locationOutline, calendarOutline });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(id);
    }
  }

  ionViewWillEnter() {
    this.toolbarService.setBackButtonVisible(true);
    this.backNav.setFallbackPath('/tabs/tab-events');
  }

  ngOnDestroy() {
    this.toolbarService.setBackButtonVisible(false);
  }

  //METTRE DATE EN FR VOIR SI LE TEMPS
  private fmtDate(date: Date, opts: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat('fr-FR', opts).format(date);
  }

  async loadEvent(id: string) {
    try {
      const ev = await this.eventService.getEventById(id);
      this.event = ev;
      this.computeStatus();
    } catch (err) {
      console.error(err);
    }
  }

  computeStatus() {
    if (!this.event) return;
    const now = new Date();
    const start = new Date(this.event.eve_date_debut);
    const end = new Date(this.event.eve_date_fin);

    if (start <= now && now <= end) {
      this.isOngoing = true;
      this.statusLabel = 'En cours';
    } else if (end < now) {
      this.isPast = true;
      this.statusLabel = 'Terminé';
    } else {
      this.statusLabel = 'À venir';
    }
  }
}
