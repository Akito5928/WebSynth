import { useState } from "react";
import { useMidiPlayer } from "./core/player/midiPlayer";
import { PianoRoll } from "./components/PianoRoll/PianoRoll";
import { Controls } from "./components/Controls/Controls";
import { Midi } from "@tonejs/midi";

export default function App() {
  const [midi, setMidi] = useState<any | null>(null);

  const player = useMidiPlayer(midi);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const midiData = new Midi(arrayBuffer);
    setMidi(midiData);
  };

  return (
    <div className="app">
      <h1>WebSynth</h1>

      <input type="file" accept=".mid" onChange={handleFile} />

      <Controls player={player} />

      {midi && (
        <PianoRoll midi={midi} currentTime={player.currentTime} />
      )}
    </div>
  );
}
