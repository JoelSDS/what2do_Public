import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'modif-event/:id',
    loadComponent: () =>
      import('./pages/modif-event/modif-event.page').then(
        (m) => m.ModifEventPage
      ),
  },
  {
    path: '**',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
