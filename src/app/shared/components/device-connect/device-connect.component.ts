import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DrawerComponent } from '../drawer/drawer.component';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { DeviceService, DeviceData } from '../../services/device';
import { map } from 'rxjs/operators';
import { ThemeService } from '../../services/theme';
import { SettingsService } from '../../services/settings';

@Component({
  selector: 'app-device-connect',
  templateUrl: './device-connect.component.html',
  styleUrls: ['./device-connect.component.scss'],
})
export class DeviceConnectComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.isAlive = false;
  }
  @Input('drawer')
  drawer: DrawerComponent;
  isOpened: boolean;
  isAlive: boolean = true;

  constructor(
    public device: DeviceService,
    public settingsServices: SettingsService,
    private themeService: ThemeService
  ) {
    this.settingsServices.settings$.subscribe((x) => {
      if (x && x.deviceIp) {
        this.onAddIp(x.deviceIp);
      }
    });
  }

  ngOnInit() {
    if (this.drawer) {
      this.drawer.onChange.subscribe((change) => {
        this.onDrawerStateChange(change);
      });
    }
  }

  onDrawerStateChange(change) {
    switch (change) {
      case 'opened':
        this.isOpened = true;
        break;
      case 'closed':
        this.isOpened = false;
        break;
    }
  }
  async onAddIp(ip) {
    if (ip && ip != '') {
      try {
        let data = await this.device.setIp(ip);
        console.log(data);
        await this.themeService.toast('Device connected successfully :)');
      } catch (err) {
        this.themeService.toast('Sorry something went wrong :( Try Again !');
      }
    }
  }
  deviceCount(data: DeviceData[]) {
    if (!data) return 0;
    return data.filter((x) => !x.thisV).length;
  }
}
