import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Opinion, OpinionForUser } from '../models/opinion.model';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AuthStorageService } from './auth-storage.service';

@Injectable({
  providedIn: 'root',
})
export class OpinionService {
  private http = inject(HttpClient);
  private authStorageService = inject(AuthStorageService);

  private baseUrl = 'http://localhost:3000/api';

  async getUserOpinions(userId: string): Promise<OpinionForUser[]> {
    try {
      const response = await lastValueFrom(
        this.http.get<OpinionForUser[]>(
          `${this.baseUrl}/users/${userId}/opinions`,
        ),
      );
      return response;
    } catch (error) {
      console.error('Erreur de récupération des commentaires', error);
      return [];
    }
  }

  async getUserOpinionForEstab(
    userId: string,
    estabId: string,
  ): Promise<Opinion | null> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return await firstValueFrom(
        this.http.get<Opinion>(
          `${this.baseUrl}/users/${userId}/opinions/${estabId}`,
          {
            headers,
          },
        ),
      );
    } catch (error) {
      console.error('Erreur de récupération des commentaires', error);
      return null;
    }
  }

  async createUserOpinion(
    userId: string,
    opinion: Opinion,
  ): Promise<Opinion | null> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      return await firstValueFrom(
        this.http.post<Opinion>(
          `${this.baseUrl}/users/${userId}/opinions`,
          opinion,
          { headers },
        ),
      );
    } catch (error) {
      console.error("Erreur lors de la création de l'opinion", error);
      return null;
    }
  }

  async updateUserOpinion(
    userId: string,
    opinion: Opinion,
  ): Promise<Opinion | null> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      return await firstValueFrom(
        this.http.put<Opinion>(
          `${this.baseUrl}/users/${userId}/opinions`,
          opinion,
          { headers },
        ),
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'opinion", error);
      return null;
    }
  }

  async deleteUserOpinion(userId: string, opinionId: string): Promise<boolean> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      await firstValueFrom(
        this.http.delete<void>(
          `${this.baseUrl}/users/${userId}/opinions/${opinionId}`,
          { headers },
        ),
      );
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'opinion", error);
      return false;
    }
  }
}
