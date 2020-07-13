import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { switchMap, share, shareReplay, map, take, tap } from 'rxjs/operators';

interface DeviceAlertRule {
  distance: number;
  sound: boolean;
}
interface DeviceData {
  id: number;
  lat: any;
  lng: any;
  thisV?: boolean;
}
interface DeviceEvent {
  devices: DeviceData[];
  alert: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  alertRule: DeviceAlertRule = null;
  i = 0;
  private alertRuleSubject$: BehaviorSubject<
    DeviceAlertRule
  > = new BehaviorSubject(null);
  alertRule$: Observable<DeviceAlertRule> = this.alertRuleSubject$.pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  private eventTrigger$: BehaviorSubject<string> = new BehaviorSubject(null);

  readonly event$: Observable<DeviceEvent> = this.eventTrigger$.pipe(
    tap((x) => {
      console.log(x);
    }),
    switchMap((x) =>
      x != null
        ? this.startTimer(x).pipe(
            map((x) =>
              this.checkBoundary(x)
                ? { ...x, alert: true, radius: this.alertRule.distance }
                : x
            )
          )
        : throwError('Device not connected :(')
    ),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  constructor(private http: HttpClient) {}

  async setIp(ip) {
    this.eventTrigger$.next(ip);
    return await this.event$.pipe(take(1)).toPromise();
  }

  addAlertRule(rule: DeviceAlertRule) {
    this.alertRule = rule;
    this.alertRuleSubject$.next(rule);
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
      devices: [
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
    if (this.alertRule) {
      const nearVs = event.devices.filter((x) => !x.thisV);
      const thisV = event.devices.filter((x) => x.thisV).pop();

      for (let i = 0; i < nearVs.length; i++) {
        const nearV = nearVs[i];
        let res = this._arePointsNear(
          { lat: +nearV.lat, lng: +nearV.lng },
          { lat: +thisV.lat, lng: +thisV.lng },
          this.alertRule.distance
        );

        if (res) return res;
      }
    } else return false;
  }
}
