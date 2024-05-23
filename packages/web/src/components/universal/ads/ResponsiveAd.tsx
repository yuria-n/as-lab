import React from 'react';

interface Props {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ResponsiveAd({ slot, className, style = { display: 'block', margin: '2rem 0 0 0' } }: Props) {
  return (
    <ins
      className={`${className ? `${className} ` : ''}adsbygoogle`}
      style={style}
      data-ad-client="ca-pub-6652387691580643"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
