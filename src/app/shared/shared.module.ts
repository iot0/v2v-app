import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { DeviceConnectComponent } from './components/device-connect/device-connect.component';
import { DrawerComponent } from './components/drawer/drawer.component';

@NgModule({
  declarations: [DeviceConnectComponent, DrawerComponent],
  imports: [IonicModule, CommonModule],
  exports: [
    CommonModule,
    IonicModule,
    LeafletModule,
    DeviceConnectComponent,
    DrawerComponent,
  ],
})
export class SharedModule {}
