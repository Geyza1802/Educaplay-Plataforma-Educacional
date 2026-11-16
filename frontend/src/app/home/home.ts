import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgClass],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  isExpanding: boolean = false;

  constructor(
    private router: Router,
    private audioService: AudioService
  ) {}

  iniciarSessao() {
    this.audioService.play();
    this.isExpanding = true;


    setTimeout(() => {
      this.router.navigate(['/selecao-perfil']);
    }, 500);
  }
}