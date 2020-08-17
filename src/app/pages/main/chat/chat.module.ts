import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat.component';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: ChatComponent,
  },
];

@NgModule({
  declarations: [ChatComponent],
  imports: [RouterModule.forChild(routes), SharedModule, ReactiveFormsModule],
})
export class ChatModule {}
