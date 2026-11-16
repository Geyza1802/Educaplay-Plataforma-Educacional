import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private bgMusic: HTMLAudioElement;
  public isMuted: boolean = false;

  constructor() {
    this.bgMusic = new Audio('lofi.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.3;
  }

  play() {
    if (this.isMuted || !this.bgMusic) return;

    this.bgMusic.play().then(() => {
      console.log('Música Lo-Fi a tocar com sucesso!');
    }).catch((err) => {
      console.error('Erro de reprodução no navegador:', err);
    });
  }

  pause() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  toggleSound(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.pause();
    } else {
      this.play();
    }
    return this.isMuted;
  }
}