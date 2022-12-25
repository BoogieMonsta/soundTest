import { Component, OnInit } from '@angular/core';
import { el } from '@elemaudio/core';
import WebAudioRenderer from '@elemaudio/web-renderer';

const core = new WebAudioRenderer();
let ctx = new AudioContext();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'seqTest';

  off = el.const({ value: 0 });

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

  play() {
    ctx.resume();
    this.generateSound();
  }

  stop() {
    core.render(this.off, this.off);
  }

  generateSound() {
    let leftChannel = el.cycle(440);
    let rightChannel = el.cycle(220);
    core.render(leftChannel, rightChannel);
  }
}


