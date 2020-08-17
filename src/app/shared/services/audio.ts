import { Injectable } from '@angular/core';

interface Sound {
  key: string;
  asset: string;
  isNative: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private sounds: Sound[] = [];
  private audioPlayer: HTMLAudioElement = new Audio();

  constructor() {}

  preload(key: string, asset: string): void {
    let audio = new Audio();
    audio.src = asset;

    this.sounds.push({
      key: key,
      asset: asset,
      isNative: false,
    });
  }

  play(key: string): void {
    let soundToPlay = this.sounds.find((sound) => {
      return sound.key === key;
    });
    this.audioPlayer.src = soundToPlay.asset;
    this.audioPlayer.loop = true;
    this.audioPlayer.play();
  }

  stop(key: string): void {
    let soundToPlay = this.sounds.find((sound) => {
      return sound.key === key;
    });

    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
  }
}
