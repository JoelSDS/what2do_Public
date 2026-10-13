import { Injectable, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { Establishment } from '../models/establishment.model';

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  private _storage: Storage | null = null;

  private TOKEN_KEY = 'auth-token';
  private USER_ID_KEY = 'user-id';
  private ACCOUNT_TYPE_KEY = 'account-type';

  // ✅ Subjects réactifs
  private loggedIn$ = new BehaviorSubject<boolean>(false);
  private userId$ = new BehaviorSubject<string | null>(null);
  private accountType$ = new BehaviorSubject<string | null>(null);
  //Signal
  currentUser = signal<User | Establishment | null>(null);

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();

    const token = await this.getToken();
    const userId = await this.getUserId();
    const accountType = await this.getAccountType();
    await this.loadCurrentUser();

    this.loggedIn$.next(!!token);
    this.userId$.next(userId);
    this.accountType$.next(accountType);
  }

  // --- Observables publics ---
  get isLoggedIn$() {
    return this.loggedIn$.asObservable();
  }

  get userId$Observable() {
    return this.userId$.asObservable();
  }

  get accountType$Observable() {
    return this.accountType$.asObservable();
  }

  // --- Token ---
  async setToken(token: string): Promise<void> {
    await this._storage?.set(this.TOKEN_KEY, token);
    this.loggedIn$.next(true);
  }

  async removeToken(): Promise<void> {
    await this._storage?.remove(this.TOKEN_KEY);
    this.loggedIn$.next(false);
  }

  async getToken(): Promise<string | null> {
    return await this._storage?.get(this.TOKEN_KEY);
  }

  // --- User ID ---
  async setUserId(userId: string): Promise<void> {
    await this._storage?.set(this.USER_ID_KEY, userId);
    this.userId$.next(userId);
  }

  async removeUserId(): Promise<void> {
    await this._storage?.remove(this.USER_ID_KEY);
    this.userId$.next(null);
  }

  async getUserId(): Promise<string | null> {
    return await this._storage?.get(this.USER_ID_KEY);
  }

  // --- Account Type ---
  async setAccountType(type: string): Promise<void> {
    await this._storage?.set(this.ACCOUNT_TYPE_KEY, type);
    this.accountType$.next(type);
  }

  async removeAccountType(): Promise<void> {
    await this._storage?.remove(this.ACCOUNT_TYPE_KEY);
    this.accountType$.next(null);
  }

  async getAccountType(): Promise<string | null> {
    return await this._storage?.get(this.ACCOUNT_TYPE_KEY);
  }

  /////Current User
  // Signal pour stocker le User ou Establishment

  async setCurrentUser(user: User | Establishment) {
    this.currentUser.set(user);
    await this._storage?.set('current-user', user); // persistance
  }

  async loadCurrentUser() {
    const stored = await this._storage?.get('current-user');
    this.currentUser.set(stored ?? null);
  }

  clearCurrentUser() {
    this.currentUser.set(null);
    this._storage?.remove('current-user');
  }
  ///SUPPRIMER CURRENT USER !!!!!!!!!!!!!!!!!!
  async logout() {
    await this.removeToken();
    await this.removeUserId();
    await this.removeAccountType();
    await this.clearCurrentUser();
  }
}
