import { NgModule } from '@angular/core';
import { MainComponent } from './main.component';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'v2v',
        loadChildren: () => import('./v2v/v2v-connect.module').then((m) => m.V2vConnectModule),
      },
      {
        path: 'chat',
        loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: '',
        redirectTo: 'settings',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  declarations: [MainComponent],
  imports: [IonicModule, RouterModule.forChild(routes), SharedModule],
})
export class MainModule {}
