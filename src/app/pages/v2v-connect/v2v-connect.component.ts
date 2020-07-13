import { Component, OnInit, OnDestroy } from '@angular/core';
import { tileLayer, latLng, circle, polygon, marker, icon } from 'leaflet';
import { Drift_Marker } from 'leaflet-drift-marker';
import { DeviceService, ThemeService } from 'src/app/shared';
import { catchError, filter, tap, takeUntil, takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

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
  constructor(
    private deviceService: DeviceService,
    private router: Router,
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
    console.count('ngOnDestroy');
  }

  ionViewDidEnter(): void {
    this.alive = true;
    console.count('ionViewDidEnter');
    this.deviceService.event$
      .pipe(
        catchError(async (err) => {
          await this.themeService.toast(err);

          setTimeout(() => {
            this.router.navigateByUrl('setup');
          }, 1000);
          return err;
        }),
        filter((x) => !!x),
        tap((x: any) => {
          this.setupMarkers(x);
        }),
        takeWhile(() => this.alive)
      )
      .subscribe();
  }
  ionViewDidLeave() {
    console.count('ionViewDidLeave');
    this.alive = false;
  }

  setupMarkers(data) {
    let newFound = false;

    let currentLength = this.layers.length;

    let alert = this.layers.filter((x) => x.id == 'alert');
    if (alert && alert.length > 0) {
      this.layers = this.layers.filter((x) => x.id != 'alert');
    }

    if (data.alert) {
      console.count('Alert');
      let thisV = data.devices.filter((x) => x.thisV).pop();
      this.layers.push({
        id: 'alert',
        layer: circle([thisV.lat, thisV.lng], { radius: data.radius * 1000 }),
      });
      console.log(thisV);
    }
    console.log(this.layers);
    if (currentLength !== this.layers.length) newFound = true;

    data.devices.forEach((device) => {
      let existing = this.layers.filter((x) => x.id == device.id).pop();
      if (existing) {
        existing.layer.slideTo([device.lat, device.lng], {
          duration: 5000,
          keepAtCenter: true,
        });
      } else {
        newFound = true;
        let layer = new Drift_Marker([device.lat, device.lng], {
          icon: icon({
            iconSize: [25, 41],
            iconAnchor: [13, 41],
            iconUrl: `assets/${
              device.thisV ? 'this-vehicle' : 'nearby-vehicle'
            }.png`,
          }),
        });

        this.layers.push({ id: device.id, layer });
      }
    });
    if (newFound) {
      console.count('newFound');
      this.layers$.next(this.layers.map((x) => x.layer));
    }
  }
}
