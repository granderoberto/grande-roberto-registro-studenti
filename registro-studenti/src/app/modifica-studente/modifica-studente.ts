import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentiService } from '../services/studenti-service';

@Component({
  imports: [FormsModule],
  selector: 'app-modifica-studente',
  styleUrl: './modifica-studente.css',
  templateUrl: './modifica-studente.html',
})
export class ModificaStudente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentiService = inject(StudentiService);
  private id = 0;
  readonly nome = signal('');
  readonly classe = signal('');
  readonly media = signal(6);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const trovato = this.studentiService.trova(id);
    if (!trovato) {
      this.router.navigate(['/elenco']);
      return;
    }
    this.id = trovato.id;
    this.nome.set(trovato.nome);
    this.classe.set(trovato.classe);
    this.media.set(trovato.mediaVoti);
  }

  salva(): void {
    this.studentiService.aggiorna({
      id: this.id,
      nome: this.nome().trim(),
      classe: this.classe().trim().toUpperCase(),
      mediaVoti: Number(this.media()),
    });
    this.router.navigate(['/elenco', this.id]);
  }
}
