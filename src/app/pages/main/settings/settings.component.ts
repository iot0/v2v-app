import { Component, OnInit } from '@angular/core';
import {
  AuthService,
  ThemeService,
  SettingsService,
  DeviceService,
} from 'src/app/shared';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  createForm: FormGroup;

  constructor(
    public auth: AuthService,
    public router: Router,
    private fb: FormBuilder,
    private themeService: ThemeService,
    private settingsServices: SettingsService,
    public deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.settingsServices.get().subscribe((x) => {
      this.patchForm(x);
    });
  }

  async onSubmit() {
    if (this.createForm.valid) {
      await this.themeService.progress(true);
      const data = this.createForm.value;
      
      await this.settingsServices.save(data);
      await this.themeService.progress(false);
    } else {
      await this.themeService.toast('All fields are required.');
    }
  }

  initForm() {
    this.createForm = this.fb.group({
      radius: [1, Validators.required],
      sound: [false],
      deviceIp: ['', Validators.required],
    });
  }

  patchForm(data) {
    if (!data) return;

    this.createForm.patchValue({
      radius: data.radius,
      sound: data.sound,
      deviceIp: data.deviceIp,
    });
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onLogout() {
    this.auth.signOut();
  }
}
