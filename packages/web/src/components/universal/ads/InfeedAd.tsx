import React from 'react';

interface Props {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
}

export function InfeedAd({ slot, className, style = { display: 'block', margin: '1rem 0' } }: Props) {
  return (
    <ins
      className={`${className ? `${className} ` : ''}adsbygoogle`}
      style={style}
      data-ad-format="fluid"
      data-ad-layout-key="-gw-3+1f-3d+2z"
      data-ad-client="ca-pub-6652387691580643"
      data-ad-slot={slot}
    />
  );
}
