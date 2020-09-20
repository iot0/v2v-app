import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DrawerComponent } from '../drawer/drawer.component';
import { DeviceService, DeviceData } from '../../services/device';
import { ThemeService } from '../../services/theme';
import { SettingsService } from '../../services/settings';
import { takeWhile } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-device-connect',
  templateUrl: './device-connect.component.html',
  styleUrls: ['./device-connect.component.scss'],
})
export class DeviceConnectComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.isAlive = false;
    console.count('DeviceConnectComponent ngOnDestroy');
  }
  @Input('drawer')
  drawer: DrawerComponent;
  isOpened: boolean;
  isAlive: boolean = true;

  settingsSubscription: Subscription;
  constructor(
    public device: DeviceService,
    public settingsServices: SettingsService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    if (this.settingsSubscription) this.settingsSubscription.unsubscribe();
    this.settingsSubscription = this.settingsServices.settings$
      .pipe(takeWhile(() => this.isAlive))
      .subscribe((x) => {
        if (x && (x.deviceIp || x.demo)) {
          this.onAddIp(x);
        }
      });

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
  async onAddIp(settings) {
    console.log('settings', settings);
    let data = await this.device.setIp(settings);
  }
  deviceCount(data: DeviceData[]) {
    if (!data) return 0;
    return data.filter((x) => !x.thisV).length;
  }
}
