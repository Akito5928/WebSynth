import * as Tone from 'tone';
import { useEffect, useState } from 'react';

export function useMidiPlayer(midi: any | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let id: number;
    const loop = () => {
      setCurrentTime(Tone.Transport.seconds);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const play = async () => {
    if (!midi) return;
    await Tone.start();
    const synth = new Tone.PolySynth().toDestination();
    Tone.Transport.cancel();
    midi.tracks[0].notes.forEach((n: any) => {
      synth.triggerAttackRelease(n.name, n.duration, n.time);
    });
    Tone.Transport.start('+0.1');
    setIsPlaying(true);
  };

  const stop = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  return { play, stop, isPlaying, currentTime };
}
