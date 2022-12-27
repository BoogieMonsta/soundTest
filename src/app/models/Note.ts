export class Note {
    freq!: number;
    octave!: number;
    name!: string;
    indexes: number[] = [];

    constructor(name: string, octave: number, freq: number) {
        this.name = name;
        this.octave = octave;
        this.freq = freq;
        this.indexes = [];
    }

    static fromName(fullName: string) {
        let name = '';
        let octave;
        let freq = 0;

        if (fullName.length < 2 || fullName.length > 3) {
            throw new Error('Invalid note name: ' + fullName);
        } else if (fullName.length == 2) {
            name = fullName.charAt(0);
            octave = parseInt(fullName.charAt(1));
        } else {
            name = fullName.charAt(0) + fullName.charAt(1);
            octave = parseInt(fullName.charAt(2));
        }

        if (octave < 0 || octave > 8) {
            throw new Error('Invalid octave: ' + octave);
        }

        // assign frequency for octave 4 based on note name
        switch (name) {
            case 'C':
                freq = 261.63;
                break;
            case 'C#':
                freq = 277.18;
                break;
            case 'Db':
                freq = 277.18;
                break;
            case 'D':
                freq = 293.66;
                break;
            case 'D#':
                freq = 311.13;
                break;
            case 'Eb':
                freq = 311.13;
                break;
            case 'E':
                freq = 329.63;
                break;
            case 'F':
                freq = 349.23;
                break;
            case 'F#':
                freq = 369.99;
                break;
            case 'Gb':
                freq = 369.99;
                break;
            case 'G':
                freq = 392.00;
                break;
            case 'G#':
                freq = 415.30;
                break;
            case 'Ab':
                freq = 415.30;
                break;
            case 'A':
                freq = 440.00;
                break;
            case 'A#':
                freq = 466.16;
                break;
            case 'Bb':
                freq = 466.16;
                break;
            case 'B':
                freq = 493.88;
                break;
        }
        // calculate frequency relative to octave 4
        let octaveMultiplier = Math.pow(2, octave - 4);
        freq = freq * octaveMultiplier;
        return new Note(name, octave, freq);
    }

    public getFullName() {
        return this.name + this.octave;
    }
}