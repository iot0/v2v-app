import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  timer,
  BehaviorSubject,
  Observable,
  of,
  throwError,
  combineLatest,
} from 'rxjs';
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
import { AudioService } from './audio';

export interface DeviceData {
  ip: string;
  latitude: any;
  longitude: any;
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
    switchMap((x) => this.startTimer(x)),
    // switchMap((x) =>
    //   combineLatest(
    //     this.startTimer(x),
    //     this.startTimer('192.168.43.172').pipe(catchError((err) => of(null)))
    //   )
    // ),
    // map((a) => {
    //   console.log('devices', a);
    //   let d1 = a[0];
    //   let d2 = a[1];
    //   let result = [];
    //   if (d1 && d1.length > 0 && +d1[0].latitude > 0) {
    //     result = [...d1];
    //   }
    //   if (d2 && d2.length > 0 && +d2[0].latitude > 0) {
    //     result = [...result, ...d2];
    //   }

    //   return result;
    // }),
    map((devices) => {
      console.log('devices', devices);
      
      let data: DeviceData[] = devices;
      if (!this.settings.demo && devices && devices.length > 0) {
        data = [];
        devices.forEach((device) => {
          data.push({
            ...device,
            thisV: device.ip == this.settings.deviceIp,
          });
        });
      }
      return this.checkBoundary({ data });
    }),
    catchError((err) => of({ error: err })),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  constructor(private http: HttpClient, private audioService: AudioService) {
    this.audioService.preload(this.alarmKey, '/assets/alarm.mp3');
  }

  async setIp(settings) {
    this.audioService.stop(this.alarmKey);
    this.settings = settings;
    this.eventTrigger$.next(settings);
    return await this.event$.pipe(take(1)).toPromise();
  }

  private startTimer(settings): Observable<DeviceData[]> {
    return timer(0, 6000).pipe(
      switchMap((x) => {
        return settings.demo
          ? this.getDeviceDataMock()
          : this.getDeviceData(settings.deviceIp);
      })
    );
  }

  private getDeviceData(ip): Observable<DeviceData[]> {
    return this.http.get(`http://${ip}/status`) as Observable<DeviceData[]>;
  }

  genThisDevicePosition() {
    let a = [
      {
        latitude: 8.789115853495895,
        longitude: 76.75907822570673,
      },
      {
        latitude: 8.790950142334939,
        longitude: 76.76040323696009,
      },
      {
        latitude: 8.792105845668477,
        longitude: 76.76137419662348,
      },
    ];

    if (this.i > 2) this.i = 0;
    return a[this.i++];
  }
  genNearbyDevicePosition() {
    let a = [
      {
        latitude: 8.787392886056638,
        longitude: 76.75802679977289,
      },
      {
        latitude: 8.78983154530818,
        longitude: 76.75948055705896,
      },
      {
        latitude: 8.79202632491241,
        longitude: 76.76131518802515,
      },
    ];

    if (this.i > 2) this.i = 0;
    return a[this.i++];
  }
  private getDeviceDataMock(): Observable<DeviceData[]> {
    return of([
      {
        ip: '1',
        thisV: true,
        ...this.genThisDevicePosition(),
      },
      {
        ip: '2',
        thisV: false,
        ...this.genNearbyDevicePosition(),
      },
    ]);
  }

  private _arePointsNear(checkPoint, centerPoint, km) {
    var ky = 40000 / 360;
    var kx = Math.cos((Math.PI * centerPoint.lat) / 180.0) * ky;
    var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
    var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
    return Math.sqrt(dx * dx + dy * dy) <= km;
  }
  private checkBoundary(event: DeviceEvent) {
    let alert = false,
      radius = this.settings.radius / 1000,
      devices = event.data.filter((x) => +x.latitude > 0);
    if (this.settings && radius && !alert) {
      const nearVs = devices.filter((x) => !x.thisV);
      const thisV = devices.filter((x) => x.thisV).pop();

      if (thisV && nearVs.length > 0) {
        for (let i = 0; i < nearVs.length; i++) {
          const nearV = nearVs[i];
          let res = this._arePointsNear(
            { lat: +nearV.latitude, lng: +nearV.longitude },
            { lat: +thisV.latitude, lng: +thisV.longitude },
            radius
          );
          alert = res;
        }
      }
    }

    if (alert && this.settings.sound) {
      this.audioService.play(this.alarmKey);
    } else {
      this.audioService.stop(this.alarmKey);
    }

    return {
      data: devices,
      alert,
      radius,
    };
  }
}
