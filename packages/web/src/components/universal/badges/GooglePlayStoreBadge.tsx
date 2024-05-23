import React from 'react';
import styled from 'styled-components';

const googlePlayStoreUrl =
  'https://play.google.com/store/apps/details?id=fans.lovelive_lab.as_app&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1';
const imgAlt = 'Google Play で手に入れよう';
const imgSrc = 'https://play.google.com/intl/ja/badges/static/images/badges/ja_badge_web_generic.png';

export function GooglePlayStoreBadge() {
  return (
    <Anchor className="google-play-store-badge" href={googlePlayStoreUrl} target="_blank" rel="noreferrer">
      <img alt={imgAlt} src={imgSrc} height={64} />
    </Anchor>
  );
}

const Anchor = styled.a`
  transition: 0.3s;
  &.google-play-store-badge:hover {
    border-bottom: none;
    opacity: 0.7;
  }
`;
