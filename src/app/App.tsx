import { useState } from 'react';
import { loadMidi } from '../core/midi/midiLoader';
import { useMidiPlayer } from '../core/player/midiPlayer';
import { PianoRoll } from '../components/PianoRoll/PianoRoll';
import { Controls } from '../components/Controls/Controls';

export function App() {
  const [midiData, setMidiData] = useState<any | null>(null);
  const player = useMidiPlayer(midiData);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const midi = await loadMidi(arrayBuffer);
    setMidiData(midi);
  };

  return (
    <div>
      <h1>WebSynth</h1>
      <input type="file" accept=".mid,.midi" onChange={onFileChange} />
      <Controls player={player} />
      <PianoRoll midi={midiData} currentTime={player.currentTime} />
    </div>
  );
}
