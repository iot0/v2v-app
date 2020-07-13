import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome.component';

const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
  },
];

@NgModule({
  declarations: [WelcomeComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class WelcomeModule {}
