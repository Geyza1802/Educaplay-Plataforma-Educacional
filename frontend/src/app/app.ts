import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AudioService } from './services/audio.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  isMuted: boolean = false;

  constructor(private audioService: AudioService) {}

  toggleAudio() {
    this.isMuted = this.audioService.toggleSound();
  }
}