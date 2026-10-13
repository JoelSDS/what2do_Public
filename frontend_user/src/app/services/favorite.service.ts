import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Favorite, FavoriteWithPreview } from '../models/favorite.model';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AuthStorageService } from './auth-storage.service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private http = inject(HttpClient);
  private authStorageService = inject(AuthStorageService);
  private baseUrl = 'http://localhost:3000/api';

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response = await lastValueFrom(
        this.http.get<Favorite[]>(`${this.baseUrl}/users/${userId}/favorites`, {
          headers,
        })
      );
      return response;
    } catch (error) {
      console.error('Erreur de récupération des favoris', error);
      return [];
    }
  }

  async getUserFavoritesWithPreview(
    userId: string
  ): Promise<FavoriteWithPreview[]> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response = await lastValueFrom(
        this.http.get<FavoriteWithPreview[]>(
          `${this.baseUrl}/users/${userId}/favorites/preview`,
          {
            headers,
          }
        )
      );

      return response;
    } catch (error) {
      console.error('Erreur de récupération des favoris', error);
      return [];
    }
  }

  async createUserFavorite(
    userId: string,
    etabId: string
  ): Promise<Favorite | null> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const body = { fav_eta_id: etabId };

      return await firstValueFrom(
        this.http.post<Favorite>(
          `${this.baseUrl}/users/${userId}/favorites`,
          body,
          { headers }
        )
      );
    } catch (error) {
      console.error('Erreur de création du favori', error);
      return null;
    }
  }

  async deleteUserFavorite(userId: string, etabId: string): Promise<boolean> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      await firstValueFrom(
        this.http.delete(
          `${this.baseUrl}/users/${userId}/favorites/${etabId}`,
          { headers }
        )
      );

      return true; // succès
    } catch (error) {
      console.error('Erreur lors de la suppression du favori', error);
      return false;
    }
  }
}
