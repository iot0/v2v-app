import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  switchMap,
  share,
  shareReplay,
  map,
  take,
  tap,
  filter,
  catchError,
} from 'rxjs/operators';
import { SettingsService } from './settings';
import { AudioService } from './audio';

interface DeviceAlertRule {
  distance: number;
  sound: boolean;
}
export interface DeviceData {
  id: number;
  lat: any;
  lng: any;
  thisV?: boolean;
}
export interface DeviceEvent {
  alert?: boolean;
  data?: DeviceData[];
  error?: any;
  radius?: number;
}

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  alarmKey = 'alarm';
  i = 0;
  settings;
  private eventTrigger$: BehaviorSubject<string> = new BehaviorSubject(null);

  readonly event$: Observable<DeviceEvent> = this.eventTrigger$.pipe(
    filter((x) => !!x),
    switchMap((x) =>
      this.startTimer(x).pipe(
        map((x) => this.checkBoundary(x)),
        catchError((err) => of({ error: err }))
      )
    ),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
    private audioService: AudioService
  ) {
    this.audioService.preload(this.alarmKey, '/assets/alarm.mp3');

    this.settingsService.settings$.subscribe((x) => {
      if (x) this.settings = x;
    });
  }

  async setIp(ip) {
    this.eventTrigger$.next(ip);
    return await this.event$.pipe(take(1)).toPromise();
  }

  private startTimer(ip): Observable<DeviceEvent> {
    return timer(0, 6000).pipe(
      switchMap((x) => {
        return this.getDeviceDataMock();
      })
    );
  }

  private getDeviceData(ip): Observable<DeviceEvent> {
    return this.http.get(`http://${ip}/status`) as Observable<DeviceEvent>;
  }

  genThisDevicePosition() {
    let a = [
      {
        lat: 8.789115853495895,
        lng: 76.75907822570673,
      },
      {
        lat: 8.790950142334939,
        lng: 76.76040323696009,
      },
      {
        lat: 8.792105845668477,
        lng: 76.76137419662348,
      },
    ];

    if (this.i > 2) this.i = 0;
    return a[this.i++];
  }
  genNearbyDevicePosition() {
    let a = [
      {
        lat: 8.787392886056638,
        lng: 76.75802679977289,
      },
      {
        lat: 8.78983154530818,
        lng: 76.75948055705896,
      },
      {
        lat: 8.79202632491241,
        lng: 76.76131518802515,
      },
    ];

    if (this.i > 2) this.i = 0;
    return a[this.i++];
  }
  genPosition2() {
    return {
      lat: (Math.random() * 360 - 180).toFixed(8),
      lng: (Math.random() * 180 - 90).toFixed(8),
    };
  }
  private getDeviceDataMock(): Observable<DeviceEvent> {
    return of({
      data: [
        {
          id: 1,
          thisV: true,
          ...this.genThisDevicePosition(),
        },
        {
          id: 2,
          thisV: false,
          ...this.genNearbyDevicePosition(),
        },
      ],
      alert: false,
    });
  }

  // credits to user:69083 for this specific function
  private _arePointsNear(checkPoint, centerPoint, km) {
    var ky = 40000 / 360;
    var kx = Math.cos((Math.PI * centerPoint.lat) / 180.0) * ky;
    var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
    var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
    return Math.sqrt(dx * dx + dy * dy) <= km;
  }
  private checkBoundary(event: DeviceEvent) {
    let alert = false,
      radius = this.settings.radius / 1000;
    if (this.settings && radius && !alert) {
      const nearVs = event.data.filter((x) => !x.thisV);
      const thisV = event.data.filter((x) => x.thisV).pop();

      for (let i = 0; i < nearVs.length; i++) {
        const nearV = nearVs[i];
        let res = this._arePointsNear(
          { lat: +nearV.lat, lng: +nearV.lng },
          { lat: +thisV.lat, lng: +thisV.lng },
          radius
        );

        alert = res;
      }
    }

    if (alert && this.settings.sound) {
      this.audioService.play(this.alarmKey);
    } else {
      this.audioService.stop(this.alarmKey);
    }

    return {
      ...event,
      alert,
      radius,
    };
  }
}
