const bees = [
  { side: 'left', x: '3%', duration: '10s', delay: '0s', size: '28px' },
  { side: 'left', x: '10%', duration: '13s', delay: '2s', size: '22px' },
  { side: 'left', x: '6%', duration: '8s', delay: '5s', size: '32px' },
  { side: 'right', x: '3%', duration: '12s', delay: '1s', size: '26px' },
  { side: 'right', x: '9%', duration: '9s', delay: '3s', size: '20px' },
  { side: 'right', x: '5%', duration: '14s', delay: '4s', size: '30px' },
  { side: 'left', x: '12%', duration: '11s', delay: '6s', size: '24px' },
  { side: 'right', x: '11%', duration: '15s', delay: '7s', size: '18px' },
];

const FlyingBees = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {bees.map((bee, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            [bee.side]: bee.x,
            fontSize: bee.size,
            animation: `bee-fly ${bee.duration} ${bee.delay} ease-in-out infinite, bee-wobble 2s ${bee.delay} ease-in-out infinite`,
          }}
        >
          🐝
        </span>
      ))}
    </div>
  );
};

export default FlyingBees;
