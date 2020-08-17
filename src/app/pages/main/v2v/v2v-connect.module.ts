import { NgModule } from '@angular/core';
import { V2vConnectComponent } from './v2v-connect.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared';

const routes: Routes = [
  {
    path: '',
    component: V2vConnectComponent,
  },
];

@NgModule({
  declarations: [V2vConnectComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class V2vConnectModule {}
