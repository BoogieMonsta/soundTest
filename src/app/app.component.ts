import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { el } from '@elemaudio/core';
import WebAudioRenderer from '@elemaudio/web-renderer';
import { Note } from './models/Note';
import { NoteNames } from './models/NoteName';
import { Step } from './models/Step';

const core = new WebAudioRenderer();
let ctx = new AudioContext();

const OFF = el.const({ value: 0 });

const C4 = 261.63;
const C4s = 277.18;
const D4b = 277.18;
const D4 = 293.66;
const D4s = 311.13;
const E4b = 311.13;
const E4 = 329.63;
const F4 = 349.23;
const F4s = 369.99;
const G4b = 369.99;
const G4 = 392.00;
const G4s = 415.30;
const A4b = 415.30;
const A4 = 440.00;
const A4s = 466.16;
const B4b = 466.16;
const B4 = 493.88;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('volume') volume!: ElementRef;

  title = 'seqTest';

  pianoRoll = Object.values(NoteNames);

  isAudioOn = false;
  tempo = 178;
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

  togglePlayPause(): void {
    ctx.resume();
    if (this.isAudioOn) {
      this.pauseAudio();
    } else {
      this.renderAudio();
    }
  }

  pauseAudio(): void {
    core.render(OFF, OFF);
    this.isAudioOn = false;
  }

  resetTempo(): void {
    this.tempo = 178;
    this.refreshAudio();
  }

  reduceTempo(): void {
    this.tempo > 5 ? this.tempo -= 5 : this.tempo = 1;
    this.refreshAudio();
  }

  increaseTempo(): void {
    this.tempo += 5;
    this.refreshAudio();
  }

  refreshAudio(): void {
    if (this.isAudioOn) {
      this.renderAudio();
      console.log('audio refreshed');

    }
  }

  fromBpmToHertz(bpm: number): any {
    return el.const({ value: 2 * bpm / 60 });
  }

  toggleStep(step: Step, noteLineName: string): void {
    const namesOfNotesPlayedOnStep = step.notes.map((note) => note.getFullName());
    if (namesOfNotesPlayedOnStep.length === 0) {
      this.addNoteToStep(step, noteLineName);
    } else if (namesOfNotesPlayedOnStep.includes(noteLineName)) {
      this.removeNoteFromStep(step, noteLineName);
    } else {
      step.notes = [];
      this.addNoteToStep(step, noteLineName);
    }
    this.buildArpFromPattern();
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
    return isNoteOnThisLine ? step.notes[0].getFullName() : '-'; // TODO : handle multiple notes
  }

  buildArpFromPattern(): void {
    this.arp = this.pattern.map((step) => {
      return step.notes.length > 0 ? step.notes[0].freq : 0; // TODO : handle multiple notes
    });
    if (this.isAudioOn) {
      this.renderAudio();
    }
  }

  renderAudio(): void {
    const train = el.train(this.fromBpmToHertz(this.tempo));
    const volume = el.const({ value: Number(this.volume.nativeElement.value) });
    core.render(
      el.mul(
        volume,
        el.cycle(
          el.seq({ seq: this.arp }, train, 0)
        )
      ),
      el.mul(
        volume,
        el.cycle(
          el.seq({ seq: this.arp }, train, 0)
        )
      )
    );
    this.isAudioOn = true;
  }
}


