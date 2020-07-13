import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ip-modal',
  templateUrl: './ip-modal.component.html'
})
export class IpModalComponent implements OnInit {
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  onClose() {
    this.modalCtrl.dismiss();
  }

  onSync(ip: string) {
    this.modalCtrl.dismiss(ip);
  }
}
