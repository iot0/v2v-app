import { Component, OnDestroy } from '@angular/core';
import { tileLayer, latLng, circle, icon } from 'leaflet';
import { Drift_Marker } from 'leaflet-drift-marker';
import {
  DeviceService,
  ThemeService,
  SettingsService,
  DeviceEvent,
} from '../../../shared';
import { catchError, filter, tap, takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-v2v-connect',
  templateUrl: './v2v-connect.component.html',
  styleUrls: ['./v2v-connect.component.scss'],
})
export class V2vConnectComponent implements OnDestroy {
  drawerOptions: any;
  alive: boolean = true;
  options = {
    layers: [tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    zoom: 16,
    center: latLng(8.80612408376523, 76.76209625835338),
  };
  layers = [];
  layers$: BehaviorSubject<any> = new BehaviorSubject([]);
  devices = [];
  circle = circle([8.80612408376523, 76.76209625835338], { radius: 100 });
  deviceSubscription: Subscription;
  constructor(
    private deviceService: DeviceService,
    private themeService: ThemeService
  ) {
    this.drawerOptions = {
      handleHeight: 50,
      thresholdFromBottom: 200,
      thresholdFromTop: 200,
      bounceBack: true,
    };
  }
  ngOnDestroy(): void {
    this.alive = false;
  }

  ionViewDidEnter(): void {
    this.alive = true;
    if (this.deviceSubscription) this.deviceSubscription.unsubscribe();

    this.deviceSubscription = this.deviceService.event$
      .pipe(
        takeWhile(() => this.alive),
        catchError(async (err) => {
          await this.themeService.toast(err);
          return err;
        }),
        filter((x) => !!x),
        tap((x: any) => {
          this.setupMarkers(x);
        })
      )
      .subscribe();
  }
  ionViewDidLeave() {
    console.count('ionViewDidLeave');
    this.alive = false;
  }

  setupMarkers(data: DeviceEvent) {
    console.log('setupMarkers', data);

    let newFound = false;

    let currentLength = this.layers.length;

    let alert = this.layers.filter((x) => x.id == 'alert');
    if (alert && alert.length > 0) {
      this.layers = this.layers.filter((x) => x.id != 'alert');
    }

    if (data.alert) {
      let thisV = data.data.filter((x) => x.thisV).pop();
      this.layers.push({
        id: 'alert',
        layer: circle([thisV.latitude, thisV.longitude], {
          radius: data.radius * 1000,
        }),
      });
    }
    if (currentLength !== this.layers.length) newFound = true;

    if (data && data.data) {
      data.data.forEach((device) => {
        let existing = this.layers.filter((x) => x.id == device.ip).pop();
        if (existing) {
          existing.layer.slideTo([device.latitude, device.longitude], {
            duration: 5000,
            keepAtCenter: true,
          });
        } else {
          newFound = true;
          let layer = new Drift_Marker([device.latitude, device.longitude], {
            icon: icon({
              iconSize: [25, 41],
              iconAnchor: [13, 41],
              iconUrl: `assets/${
                device.thisV ? 'this-vehicle' : 'nearby-vehicle'
              }.png`,
            }),
          });

          this.layers.push({ id: device.ip, layer });
        }
      });
    } else {
      this.layers = [];
      newFound = true;
    }
    if (newFound) {
      console.count('newFound');
      this.layers$.next(this.layers.map((x) => x.layer));
    }
  }
}
