import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ThemeService } from '../../shared';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  isAdmin: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    public theme: ThemeService
  ) {}

  ngOnInit() {}

  async onLogin() {
    try {
      let credential = await this.auth.googleSignIn();

      console.log(credential);

      let uid = credential.user.uid;

      if (uid) {
        this.router.navigateByUrl('main');
      }
    } catch (err) {
      this.theme.toast(
        'Sorry something went wrong, please check your connection'
      );
      console.log(err);
    }
  }
}
