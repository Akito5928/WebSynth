type Props = {
  player: {
    play: () => void;
    stop: () => void;
    isPlaying: boolean;
  };
};

export function Controls({ player }: Props) {
  return (
    <div>
      <button onClick={player.isPlaying ? player.stop : player.play}>
        {player.isPlaying ? 'Stop' : 'Play'}
      </button>
    </div>
  );
}
