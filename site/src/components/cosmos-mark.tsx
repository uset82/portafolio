/**
 * Cosmos mark: ASTROEA's natal-chart wheel holding Pináculo's rising triangle.
 *
 * 24 ticks = Pináculo positions. Every second tick is longer = 12 houses.
 * The triangle is the pinnacle, rising from the horizon (ASC–DSC) toward MC.
 * The line below the base is IC / the unpublished side. No zodiac glyphs.
 */
const CX = 50;
const CY = 50;

const ticks = Array.from({ length: 24 }, (_, index) => {
  const angle = ((index * 15 - 90) * Math.PI) / 180;
  const isHouse = index % 2 === 0;
  const inner = isHouse ? 37.2 : 40.4;
  const outer = 44.6;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    key: index,
    x1: CX + cos * inner,
    y1: CY + sin * inner,
    x2: CX + cos * outer,
    y2: CY + sin * outer,
  };
});

type CosmosMarkProps = {
  className?: string;
};

export function CosmosMark({ className }: CosmosMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="cosmos-mark__ring" cx={CX} cy={CY} r="44.6" />
      <circle className="cosmos-mark__ring cosmos-mark__ring--inner" cx={CX} cy={CY} r="28.5" />
      {ticks.map((tick) => (
        <line
          key={tick.key}
          className="cosmos-mark__tick"
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
        />
      ))}
      <line className="cosmos-mark__axis" x1="18" y1="58" x2="82" y2="58" />
      <line className="cosmos-mark__axis" x1="50" y1="22" x2="50" y2="78" />
      <polygon className="cosmos-mark__peak" points="50,24 32,58 68,58" />
      <polygon className="cosmos-mark__diamond" points="50,20.4 53.4,24 50,27.6 46.6,24" />
    </svg>
  );
}
