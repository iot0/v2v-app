import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "./login.component";
import { Routes, RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";

const routes: Routes = [
  {
    path: "",
    component: LoginComponent
  }
];

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)]
})
export class LoginModule {}
