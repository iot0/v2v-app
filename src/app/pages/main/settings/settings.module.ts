import { NgModule } from "@angular/core";
import { SettingsComponent } from "./settings.component";
import { Routes, RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "src/app/shared";
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: "",
    component: SettingsComponent,
  },
];

@NgModule({
  declarations: [SettingsComponent],
  imports: [IonicModule, RouterModule.forChild(routes), SharedModule,ReactiveFormsModule],
})
export class SettingsModule {}
