import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { IpModalComponent } from './components/ip-modal/ip-modal.component';
import { DeviceConnectComponent } from './components/device-connect/device-connect.component';
import { DrawerComponent } from './components/drawer/drawer.component';

@NgModule({
  declarations: [IpModalComponent, DeviceConnectComponent, DrawerComponent],
  imports: [IonicModule, CommonModule],
  exports: [
    CommonModule,
    IonicModule,
    LeafletModule,
    IpModalComponent,
    DeviceConnectComponent,
    DrawerComponent,
  ],
})
export class SharedModule {}
