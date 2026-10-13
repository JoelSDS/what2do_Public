import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab-events',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../tab-events/tab-events.page').then(
                (m) => m.TabEventsPage
              ),
          },
          {
            path: 'event-details/:id',
            loadComponent: () =>
              import('../pages/event-details/event-details.page').then(
                (m) => m.EventDetailsPage
              ),
          },
        ],
      },
      {
        path: 'tab-establishments',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                '../tab-establishments/tab-establishments/tab-establishments.page'
              ).then((m) => m.TabEstablishmentsPage),
          },
          {
            path: 'establishment-details/:id',
            loadComponent: () =>
              import(
                '../pages/establishment-details/establishment-details.page'
              ).then((m) => m.EstablishmentDetailsPage),
          },
        ],
      },
      {
        path: 'login',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../auth/login/login.page').then((m) => m.LoginPage),
          },
          {
            path: 'forgot-password',
            loadComponent: () =>
              import('../auth/forgot-password/forgot-password.page').then(
                (m) => m.ForgotPasswordPage
              ),
          },
        ],
      },
      {
        path: 'profil-user/:id',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../pages/profilUser/profil-user/profil-user.page').then(
                (m) => m.ProfilUserPage
              ),
          },
          {
            path: 'opinions',
            loadComponent: () =>
              import('../pages/opinions/opinions.page').then(
                (m) => m.OpinionsPage
              ),
          },
        ],
      },
      {
        path: 'profil-estab',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                '../pages/profilEstab/profil-estab/profil-estab.page'
              ).then((m) => m.ProfilEstabPage),
          },
          {
            path: 'estab-modif',
            loadComponent: () =>
              import('../pages/estab-modif/estab-modif.page').then(
                (m) => m.EstabModifPage
              ),
          },
          {
            path: 'create-event',
            loadComponent: () =>
              import('../pages/create-event/create-event.page').then(
                (m) => m.CreateEventPage
              ),
          },
          {
            path: 'modif-event/:id',
            loadComponent: () =>
              import('../pages/modif-event/modif-event.page').then(
                (m) => m.ModifEventPage
              ),
          },
        ],
      },
      {
        path: 'reset-password/:resetToken',
        loadComponent: () =>
          import('../auth/reset-password/reset-password.page').then(
            (m) => m.ResetPasswordPage
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/tab-events',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab-events',
    pathMatch: 'full',
  },
];
