import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event, EventPure } from '../models/event.model';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AuthStorageService } from './auth-storage.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private authStorageService = inject(AuthStorageService);

  private baseUrl = 'http://localhost:3000/api';

  async getEvents(
    page: number,
    limit: number,
    searchValue: string,
    categoryId: string | null
  ): Promise<Event[] | null> {
    try {
      // On construit les query params uniquement si nécessaires
      let query = `?page=${page}&limit=${limit}`;

      if (searchValue && searchValue.trim() !== '') {
        query += `&searchValue=${encodeURIComponent(searchValue.trim())}`;
      }

      if (categoryId && categoryId !== null) {
        query += `&categoryId=${categoryId}`;
      }

      return await lastValueFrom(
        this.http.get<Event[]>(`${this.baseUrl}/events${query}`)
      );
    } catch (error) {
      console.error('Erreur de récupération des événements', error);
      return null;
    }
  }

  async getEventById(id: string): Promise<Event | null> {
    try {
      return await firstValueFrom(
        this.http.get<Event>(`${this.baseUrl}/events/${id}`)
      );
    } catch (error) {
      console.error(`Erreur de récupération de l'événement`, error);
      return null;
    }
  }

  async getEstablishmentEvents(
    page: number,
    limit: number,
    estabId: string
  ): Promise<Event[] | null> {
    try {
      // On construit les query params uniquement si nécessaires
      let query = `?page=${page}&limit=${limit}`;

      return await lastValueFrom(
        this.http.get<Event[]>(
          `${this.baseUrl}/establishments/${estabId}/events${query}`
        )
      );
    } catch (error) {
      console.error('Erreur de récupération des événements', error);
      return null;
    }
  }

  async createEvent(event: EventPure): Promise<EventPure | null> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return await firstValueFrom(
        this.http.post<EventPure>(`${this.baseUrl}/events`, event, { headers })
      );
    } catch (error) {
      console.error('Erreur de création du compte', error);
      return null;
    }
  }

  async updateEvent(
    eventId: string,
    updatedEvent: EventPure
  ): Promise<EventPure | null> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      return await firstValueFrom(
        this.http.put<EventPure>(
          `${this.baseUrl}/events/${eventId}`,
          updatedEvent,
          { headers }
        )
      );
    } catch (error) {
      console.error(`Erreur de mise à jour de l'événement`, error);
      return null;
    }
  }

  async softDeleteEvent(eventId: string): Promise<Event | null> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const body = { eve_isActive: false };

      return await firstValueFrom(
        this.http.delete<Event>(`${this.baseUrl}/events/${eventId}`, {
          headers,
        })
      );
    } catch (error) {
      console.error(`Erreur de désactivation de l'événement`, error);
      return null;
    }
  }
}
