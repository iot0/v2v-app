import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DrawerComponent } from '../drawer/drawer.component';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { DeviceService } from '../../services/device';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-device-connect',
  templateUrl: './device-connect.component.html',
  styleUrls: ['./device-connect.component.scss'],
})
export class DeviceConnectComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.isAlive = false;
  }
  event$: BehaviorSubject<any> = new BehaviorSubject({ type: 'setup' });
  rule$: Observable<any> = null;
  device$: Observable<any> = null;
  deviceCount$: Observable<any> = null;

  @Input('drawer')
  drawer: DrawerComponent;
  isOpened: boolean;
  isAlive: boolean = true;

  constructor(public deviceService: DeviceService) {
    this.rule$ = this.deviceService.alertRule$;
    this.device$ = this.deviceService.event$;
    this.deviceCount$ = this.deviceService.event$.pipe(
      map((x) => x.devices.filter((x) => !x.thisV).length)
    );
  }

  ngOnInit() {
    if (this.drawer) {
      this.drawer.onChange.subscribe((change) => {
        this.onDrawerStateChange(change);
      });
    }
  }

  //TODO: To show arrow accordingly for customer popup
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
  onAddAlert(distance, sound: boolean) {
    if (distance) {
      this.deviceService.addAlertRule({
        distance,
        sound,
      });
    }
  }
}
