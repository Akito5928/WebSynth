import { Midi } from "@tonejs/midi";

export async function loadMidi(buffer: ArrayBuffer) {
  const midi = new Midi(buffer);
  return midi;
}
