import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { el } from '@elemaudio/core';
import WebAudioRenderer from '@elemaudio/web-renderer';
import { Note } from './models/Note';
import { NoteNames } from './models/NoteNames';
import { Step } from './models/Step';

const core = new WebAudioRenderer();

const OFF = el.const({ value: 0 });

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {

  ctx = new AudioContext();

  volume = 0.5;

  title = 'seqTest';

  pianoRoll = Object.values(NoteNames) as string[];
  showNoteNames = false;
  notesPerBeat = 4;

  tempo = 89;
  isArpPlaying = false;
  pattern: Step[] = [];
  patternLength: number = 16;
  arp: number[] = [];

  ngOnInit() {
    // initialize the audio core
    core.on('load', () => {
      core.on('error', (e: any) => {
        console.log(e);
      });
    });
    this.main();

    // initialize the pattern
    for (let i = 0; i < this.patternLength; i++) {
      this.pattern.push({
        notes: [],
        seqIdx: i,
      } as Step);
    }
  }

  ngAfterViewInit(): void {
    this.rollPianoHome();
  }

  private async main() {
    let node = await core.initialize(this.ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    node.connect(this.ctx.destination);
  };

  async toggleSoundOnOff(): Promise<void> {
    if (this.ctx.state !== 'running') {
      await this.ctx.resume();
    } else {
      await this.ctx.suspend();
    }
  }

  pauseAudio(): void {
    core.render(OFF, OFF);
    this.isArpPlaying = false;
  }

  resetTempo(): void {
    this.tempo = 89;
    this.renderArp();
  }

  reduceTempo(): void {
    this.tempo > 1 ? this.tempo -= 1 : this.tempo = 1;
    this.renderArp();
  }

  increaseTempo(): void {
    this.tempo += 1;
    this.renderArp();
  }

  fromBpmToHertz(bpm: number): any {
    return el.const({ value: this.notesPerBeat * bpm / 60 });
  }

  playNote(noteName: string): void {
    const note = Note.fromName(noteName);
    const freq = el.const({ value: note.freq });
    const volume = el.const({ value: this.volume });
    core.render(
      el.mul(volume, el.cycle(freq)),
      el.mul(volume, el.cycle(freq))
    );
  }

  // TODO : handle multiple notes
  async toggleStep(step: Step, noteLineName: string): Promise<void> {
    await this.ctx.resume();

    const namesOfNotesPlayedOnStep = step.notes.map((note) => note.getFullName());
    if (namesOfNotesPlayedOnStep.length === 0) {
      this.playNote(noteLineName);
      this.addNoteToStep(step, noteLineName);
    } else if (namesOfNotesPlayedOnStep.includes(noteLineName)) {
      this.removeNoteFromStep(step, noteLineName);
    } else {
      step.notes = [];
      this.addNoteToStep(step, noteLineName);
    }
    if (this.isArpPlaying) {
      this.buildArpFromPattern();
    }
  }

  removeNoteFromStep(step: Step, noteLineName: string): void {
    step.notes = step.notes.filter((note: Note) => note.getFullName() !== noteLineName);
  }

  addNoteToStep(step: Step, noteLineName: string): void {
    step.notes.push(Note.fromName(noteLineName));
  }

  isNoteOnStep(step: Step, noteLineName: string): boolean {
    const namesOfNotesPlayedOnStep = step.notes.map((note) => note.getFullName());
    return namesOfNotesPlayedOnStep.includes(noteLineName); // TODO : handle multiple notes
  }

  rollPianoHome(): void {
    (document.getElementById(NoteNames.A4) as HTMLElement).scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  }

  displayVolume(): string {
    return (this.volume * 100).toFixed() + '%';
  }

  buildArpFromPattern(): void {
    this.arp = this.pattern.map((step) => {
      return step.notes.length > 0 ? step.notes[0].freq : 0; // TODO : handle multiple notes
    });
    if (!this.isArpPlaying) {
      this.renderArp();
    }
  }

  clearAllSteps(): void {
    this.pattern.forEach((step) => {
      step.notes = [];
    });
    if (this.isArpPlaying) {
      this.buildArpFromPattern();
    }
  }

  @HostListener('window:keydown.space', ['$event'])
  handleKeyDown(): boolean {
    if (!this.isArpPlaying) {
      this.buildArpFromPattern();
    } else {
      this.pauseAudio();
    }
    return false; // prevent default
  }

  renderArp(): void {
    const train = el.train(this.fromBpmToHertz(this.tempo));
    const volume = el.const({ value: this.volume });
    core.render(
      el.mul(
        volume,
        el.cycle(
          el.seq2({ seq: this.arp }, train, 0)
        )
      ),
      el.mul(
        volume,
        el.cycle(
          el.seq2({ seq: this.arp }, train, 0)
        )
      )
    );
    this.isArpPlaying = true;
  }
}


