import { useState } from "react";
import { loadMidi } from "../core/midi/midiLoader";
import { useMidiPlayer } from "../core/player/midiPlayer";
import { PianoRoll } from "../components/PianoRoll/PianoRoll";
import { Controls } from "../components/Controls/Controls";
import "../styles/globals.css";

export function App() {
  const [midiData, setMidiData] = useState<any | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const player = useMidiPlayer(midiData);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const arrayBuffer = await file.arrayBuffer();
    const midi = await loadMidi(arrayBuffer);
    setMidiData(midi);
  };

  return (
    <div className="container">
      <h1>WebSynth</h1>

      <div className="file-row">
        <input type="file" accept=".mid,.midi" onChange={onFileChange} />
        <div className="filename" title={fileName}>{fileName}</div>
      </div>

      <Controls player={player} />

      <PianoRoll midi={midiData} currentTime={player.currentTime} />
    </div>
  );
}
