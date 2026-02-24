const bees = [
  { side: 'left', x: '3%', duration: '10s', delay: '0s', size: 28, flipped: false },
  { side: 'left', x: '10%', duration: '13s', delay: '2s', size: 22, flipped: true },
  { side: 'left', x: '6%', duration: '8s', delay: '5s', size: 32, flipped: false },
  { side: 'right', x: '3%', duration: '12s', delay: '1s', size: 26, flipped: true },
  { side: 'right', x: '9%', duration: '9s', delay: '3s', size: 20, flipped: false },
  { side: 'right', x: '5%', duration: '14s', delay: '4s', size: 30, flipped: true },
  { side: 'left', x: '12%', duration: '11s', delay: '6s', size: 24, flipped: false },
  { side: 'right', x: '11%', duration: '15s', delay: '7s', size: 18, flipped: true },
];

const FlyingBees = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {bees.map((bee, i) => (
        <img
          key={i}
          src="/images/bee.png"
          alt=""
          draggable={false}
          className="absolute pointer-events-none select-none"
          style={{
            [bee.side]: bee.x,
            width: `${bee.size}px`,
            height: 'auto',
            transform: bee.flipped ? 'scaleX(-1)' : undefined,
            animation: `bee-fly ${bee.duration} ${bee.delay} ease-in-out infinite, bee-wobble 2s ${bee.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default FlyingBees;
