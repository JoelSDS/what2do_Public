import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Establishment } from '../models/establishment.model';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AuthStorageService } from './auth-storage.service';

@Injectable({
  providedIn: 'root',
})
export class EstablishmentService {
  private http = inject(HttpClient);
  private authStorageService = inject(AuthStorageService);

  private baseUrl = 'http://localhost:3000/api';

  async getEstablishments(
    page: number,
    limit: number,
    searchValue: string,
    categoryId: string | null
  ): Promise<Establishment[] | null> {
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
        this.http.get<Establishment[]>(`${this.baseUrl}/establishments${query}`)
      );
    } catch (error) {
      console.error('Erreur de récupération des établissements', error);
      return null;
    }
  }

  async getEstablishment(id: string): Promise<Establishment | null> {
    try {
      return await firstValueFrom(
        this.http.get<Establishment>(`${this.baseUrl}/establishments/${id}`)
      );
    } catch (error) {
      console.error(`Erreur de récupération de l'utilisateur`, error);
      return null;
    }
  }

  async getEstablishmentPreview(id: string): Promise<Establishment | null> {
    try {
      return await firstValueFrom(
        this.http.get<Establishment>(
          `${this.baseUrl}/establishments/${id}/preview`
        )
      );
    } catch (error) {
      console.error(`Erreur de récupération de l'utilisateur`, error);
      return null;
    }
  }

  async createUser(
    establishment: Establishment
  ): Promise<Establishment | null> {
    try {
      return await firstValueFrom(
        this.http.post<Establishment>(`${this.baseUrl}/establishments`, {
          establishment,
        })
      );
    } catch (error) {
      console.error('Erreur de création du compte', error);
      return null;
    }
  }

  async updateEstablishment(
    esta: Establishment
  ): Promise<Establishment | null> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      console.log('service esta :', esta);
      return await firstValueFrom(
        this.http.put<Establishment>(
          `${this.baseUrl}/establishments/${esta.id}`,
          esta,
          {
            headers,
          }
        )
      );
    } catch (error) {
      console.error('Erreur de création du compte', error);
      return null;
    }
  }
}
