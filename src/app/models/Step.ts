import { Note } from "./Note";

export interface Step {
    seqIdx: number, // index of the step in the sequence
    notes: Note[],
}