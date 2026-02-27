type Props = {
  player: {
    play: () => void;
    stop: () => void;
    isPlaying: boolean;
    instrument: string;
    setInstrument: (v: string) => void;
  };
};

export function Controls({ player }: Props) {
  return (
    <div className="controls">
      <button onClick={player.isPlaying ? player.stop : player.play}>
        {player.isPlaying ? "Stop" : "Play"}
      </button>

      <select
        value={player.instrument}
        onChange={(e) => player.setInstrument(e.target.value)}
      >
        <option value="synth">Synth</option>
        <option value="pianoLike">Piano (風)</option>
        <option value="violinLike">Violin (風)</option>
        <option value="pad">Pad</option>
        <option value="chip">ChipTune</option>
      </select>
    </div>
  );
}
