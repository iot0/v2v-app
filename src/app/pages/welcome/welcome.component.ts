import { Component, OnInit } from '@angular/core';
import { DeviceService, ThemeService } from 'src/app/shared';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(
    public deviceService: DeviceService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async onAddIp(ip) {
    if (ip && ip != '') {
      try {
        let data = await this.deviceService.setIp(ip);
        console.log(data);
        await this.themeService.toast('Device connected successfully :)');

        setTimeout(() => {
          this.router.navigate(['v2v']);
        }, 500);
      } catch (err) {
        console.error(err);
        this.themeService.toast('Sorry something went wrong :( Try Again !');
      }
    }
  }
}
