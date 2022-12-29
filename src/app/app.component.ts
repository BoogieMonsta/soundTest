import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { el } from '@elemaudio/core';
import WebAudioRenderer from '@elemaudio/web-renderer';
import { Note } from './models/Note';
import { NoteNames } from './models/NoteName';
import { Step } from './models/Step';

const core = new WebAudioRenderer();
let ctx = new AudioContext();

const OFF = el.const({ value: 0 });

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  volume = 0.5;

  title = 'seqTest';

  pianoRoll = Object.values(NoteNames);

  tempo = 178;
  isArpPlaying = false;
  pattern: Step[] = [
    {
      seqIdx: 1,
      notes: [],
    },
    {
      seqIdx: 2,
      notes: [],
    },
    {
      seqIdx: 3,
      notes: [],
    },
    {
      seqIdx: 4,
      notes: [],
    },
    {
      seqIdx: 5,
      notes: [],
    },
    {
      seqIdx: 6,
      notes: [],
    },
    {
      seqIdx: 7,
      notes: [],
    },
    {
      seqIdx: 8,
      notes: [],
    },
  ];
  arp = [0, 0, 0, 0, 0, 0, 0, 0];

  async ngOnInit() {
    core.on('load', () => {
      core.on('error', (e: any) => {
        console.log(e);
      });
    });
    await this.main();
  }

  private async main() {
    let node = await core.initialize(ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    node.connect(ctx.destination);
  };

  async toggleSoundOnOff(): Promise<void> {
    if (ctx.state !== 'running') {
      await ctx.resume();
    } else {
      await ctx.suspend();
    }
  }

  pauseAudio(): void {
    core.render(OFF, OFF);
    this.isArpPlaying = false;
  }

  resetTempo(): void {
    this.tempo = 178;
    this.renderArp();
  }

  reduceTempo(): void {
    this.tempo > 5 ? this.tempo -= 5 : this.tempo = 1;
    this.renderArp();
  }

  increaseTempo(): void {
    this.tempo += 5;
    this.renderArp();
  }

  fromBpmToHertz(bpm: number): any {
    return el.const({ value: 2 * bpm / 60 });
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
    await ctx.resume();

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

  displayStep(step: Step, noteLineName: string): string {
    const namesOfNotesPlayedOnStep = step.notes.map((note) => note.getFullName());
    const isNoteOnThisLine = namesOfNotesPlayedOnStep.includes(noteLineName);
    return isNoteOnThisLine ? step.notes[0].getFullName() : ''; // TODO : handle multiple notes
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


