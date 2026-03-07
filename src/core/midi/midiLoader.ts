import { Midi } from "@tonejs/midi";

export async function loadMidi(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return new Midi(arrayBuffer);
}
