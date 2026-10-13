import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonChip,
  IonBadge,
  IonLabel,
  IonIcon,
  IonButton,
  IonAvatar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  chevronForwardOutline,
  heartOutline,
  locationOutline,
  shareOutline,
  timeOutline,
} from 'ionicons/icons';
import { Event } from 'src/app/models/event.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  imports: [
    CommonModule,
    IonCard,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonImg,
    IonChip,
    IonBadge,
    IonLabel,
    IonIcon,
    IonButton,
    IonAvatar,
  ],
})
export class EventCardComponent implements OnInit {
  @Input() event!: Event;
  @Input() compact = false; // Variante compacte
  @Input() showInformations = true; // Masquer/afficher le résumé
  @Input() showVenueLogo = true; // Afficher le logo établissement
  @Output() open = new EventEmitter<void>();
  @Output() favorite = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();

  ngOnInit() {
    addIcons({
      timeOutline,
      calendarOutline,
      locationOutline,
      shareOutline,
      heartOutline,
      chevronForwardOutline,
    });
  }

  get heroImage(): string {
    return this.event?.eve_images?.[0] ?? 'assets/defaultEvent.jpg';
  }

  get start(): Date {
    return new Date(this.event.eve_date_debut);
  }
  get end(): Date {
    return new Date(this.event.eve_date_fin);
  }
  get now(): Date {
    return new Date();
  }

  get isOngoing(): boolean {
    return this.start <= this.now && this.now <= this.end;
  }
  get isPast(): boolean {
    return this.end < this.now;
  }
  get statusLabel(): string {
    if (this.isOngoing) return 'En cours';
    if (this.isPast) return 'Terminé';
    return 'À venir';
  }
  //calcule le temps restant en jours ou heures.
  get countdownLabel(): string | null {
    if (this.isOngoing || this.isPast) return null;
    const diff = this.start.getTime() - this.now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 1) return `Dans ${days} jours`;
    if (days === 1) return 'Dans 1 jour';
    // < 24h
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    return `Dans ${hours} h`;
  }

  private fmtDate(date: Date, opts: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat('fr-FR', opts).format(date);
  }

  get dateRangeShort(): string {
    const sameDay = this.start.toDateString() === this.end.toDateString();
    if (sameDay) {
      const day = this.fmtDate(this.start, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      });
      const t1 = this.fmtDate(this.start, {
        hour: '2-digit',
        minute: '2-digit',
      });
      const t2 = this.fmtDate(this.end, { hour: '2-digit', minute: '2-digit' });
      return `${day} • ${t1}–${t2}`;
    }
    const d1 = this.fmtDate(this.start, { day: '2-digit', month: 'short' });
    const d2 = this.fmtDate(this.end, { day: '2-digit', month: 'short' });
    return `${d1} → ${d2}`;
  }

  get venueName(): string {
    return this.event?.eve_eta_id?.eta_name ?? 'Établissement';
  }
  get venueAddress(): string | undefined {
    return this.event?.eve_eta_id?.eta_address;
  }
  get venueLogo(): string | undefined {
    return (
      this.event?.eve_eta_id?.eta_logo || 'assets/defaultEstablishment.png'
    );
  }

  onOpen() {
    this.open.emit();
  }
  onFavorite() {
    this.favorite.emit();
  }
  onShare() {
    this.share.emit();
  }
}
