# Risposte

## 1. Che cos'è app.routes.ts e che cosa contiene in questo progetto?

`app.routes.ts` è il file dove dico ad Angular quale componente mostrare per ogni indirizzo. Contiene un array `routes`. Il router guarda l'URL e mette il componente giusto dentro `<router-outlet />`.

Le route che ci sono sono queste:

- `''` fa un redirect a `home`
- `home` mostra `Home`
- `elenco` mostra `Elenco`
- `inserimento` mostra `Inserimento`
- `elenco/:id` mostra `DettaglioStudente` (per esempio `/elenco/3`)
- `modifica/:id` mostra `ModificaStudente` (per esempio `/modifica/2`)
- `**` fa un redirect a `home`

L'ordine conta. La wildcard `**` sta per ultima, perché prende tutto quello che non è stato trovato prima. Se la mettessi all'inizio, ogni pagina porterebbe alla home.

## 2. Che cos'è un service e perché lo si usa? Perché gli studenti stanno in StudentiService e non in Elenco?

Un service è una classe che tiene dati o logica da condividere tra più componenti. Angular ne crea una sola istanza e la dà a chi la chiede con `inject()`.

Gli studenti stanno in `StudentiService` perché li usano più pagine. La home mostra "Studenti registrati: 5", l'elenco mostra la tabella, l'inserimento aggiunge Anna Gialli, il dettaglio cerca per id. Se i dati fossero dentro `Elenco`, quando cambio pagina il componente viene distrutto e i dati andrebbero persi. Nel servizio restano. Per questo, se elimino Paolo Russo nell'elenco, la home dice 4.

## 3. Come si legge l'id dello studente dall'URL? Perché va convertito con Number?

Si inietta `ActivatedRoute` e si legge `paramMap.get('id')`. Nel dettaglio uso `this.route.paramMap.subscribe(...)`.

Dall'URL l'id arriva sempre come stringa. Con `/elenco/2` ottengo `'2'`, non `2`. Il metodo `trova` usa `s.id === id`, e `2 === '2'` è falso. Senza `Number(...)` non troverei nessuno studente e il dettaglio mi rimanderebbe sempre all'elenco.

## 4. Perché il signal dati è privato e i componenti leggono studenti? Che cosa potrebbe succedere se Elenco potesse chiamare set?

`dati` è privato così solo il servizio può cambiarlo. I componenti leggono `studenti`, che è `dati.asReadonly()`: si può leggere ma non fare `set` o `update`. Per cambiare qualcosa si usano i metodi `aggiungi`, `rimuovi` e `aggiorna`.

Se `Elenco` potesse fare `set`, potrebbe per sbaglio sostituire la lista con una lista vuota o con studenti senza id. Anche la home e il dettaglio si troverebbero dati cambiati senza sapere chi li ha toccati. Con i metodi del servizio le regole stanno in un posto solo, per esempio il calcolo dell'id.

## 5. Come viene calcolato l'id di un nuovo studente? Perché "numero di studenti + 1" sarebbe sbagliato?

Il servizio prende l'id più grande tra quelli che ci sono e aggiunge uno: `Math.max(0, ...ids) + 1`. Lo 0 serve per il caso di lista vuota.

Esempio: ho 5 studenti con id da 1 a 5 e elimino Sara Rossi (id 2). Ne restano 4. Con "numero + 1" il nuovo studente avrebbe id 5, ma Paolo Russo ha già il 5. Ci sarebbero due studenti con lo stesso id, e `trova(5)` e il `track s.id` si confonderebbero. Con il massimo, il nuovo studente prende 6.

## 6. Che cosa succede, passo per passo, quando scrivo una lettera nel campo del filtro?

1. Premo un tasto, per esempio scrivo `4`, poi `A`.
2. `[(ngModel)]` aggiorna il signal `filtroClasse` con il testo nuovo.
3. Il computed `filtrati` legge `filtroClasse()`, quindi Angular sa che deve ricalcolarlo.
4. `filtrati` toglie gli spazi, mette tutto maiuscolo e tiene gli studenti con quella classe. Con `4A` restano Marco Verdi e Giulia Neri.
5. Il template legge `filtrati()` e `visibili()`, quindi la tabella si aggiorna da sola.

Se non c'è nessuno, compare l'avviso giallo, per esempio per `5C`.

## 7. A che cosa servono #modulo="ngForm" e [disabled]="modulo.invalid"? Quali condizioni rendono il form non valido?

`#modulo="ngForm"` crea una variabile del template che punta all'oggetto con cui Angular controlla il form, non al tag `<form>`. Con quell'oggetto posso sapere se il form è valido.

`[disabled]="modulo.invalid"` spegne il pulsante Salva quando il form non è valido, così non si salvano dati sbagliati.

Il form è non valido se:

- il nome è vuoto (`required`)
- la classe è vuota (`required`)
- la media è vuota, minore di 1 o maggiore di 10 (`required`, `min="1"`, `max="10"`)

Per esempio con media 11 il pulsante resta grigio.

## 8. Perché dopo il salvataggio si usa router.navigate(['/elenco']) invece di un link?

Perché il cambio pagina deve avvenire dopo che il salvataggio è finito, non quando clicco. Un link ti porta via subito, anche se i dati non sono validi o `salva()` non è ancora stato eseguito. Con `router.navigate` lo faccio da codice, come ultima riga di `salva()`, quando l'azione è già andata a buon fine. Lo uso anche nel dettaglio dopo `rimuovi` e nella modifica per tornare alla scheda.

## 9. Quali input e quale output ha StudenteCard? Perché la card non chiama il servizio per rimuovere lo studente?

Ha due input e un output:

- `studente` è un input obbligatorio (`input.required<Studente>()`)
- `azioni` è un input facoltativo che vale `true` se non lo passo
- `rimosso` è un output che emette lo studente da rimuovere

Nella home passo `[azioni]="false"` e il pulsante non compare. Nel dettaglio il pulsante c'è e la card emette `rimosso`.

La card non chiama il servizio perché così si può riusare. Deve solo mostrare uno studente e avvisare il padre. Nella home non rimuove niente, nel dettaglio il padre (`DettaglioStudente`) decide di chiamare `rimuovi` e poi di tornare all'elenco. Se la card toccasse i dati, farebbe sempre la stessa cosa in tutte le pagine.

## 10. Perché Studente successivo funziona solo con paramMap.subscribe? Che cosa vedrei con lo snapshot?

Da `/elenco/2` vado a `/elenco/3`. La route è sempre `elenco/:id`, quindi Angular riusa lo stesso componente e non rifà `ngOnInit`. Cambia solo il parametro. Con `paramMap.subscribe` ricevo il nuovo valore ogni volta che l'URL cambia e aggiorno il signal `studente`, quindi la scheda cambia.

Con lo snapshot leggerei l'id una volta sola, la prima volta che il componente nasce. Vedrei l'URL cambiare (da `/elenco/2` a `/elenco/3`) ma la scheda resterebbe ferma su Sara Rossi.

Nella modifica invece lo snapshot va bene: si arriva a `modifica/:id` da un link dell'elenco, il componente viene creato da zero ogni volta e non c'è un pulsante che cambia solo l'id.
