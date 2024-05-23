export const config = {
  version: process.env.REACT_APP_VERSION ?? '',
  strict: true,
  domain: process.env.REACT_APP_DOMAIN ?? '',
  event: process.env.REACT_APP_EVENT_KEY ?? '',
  development: /development/.test(process.env.NODE_ENV),
  feature: /true/i.test(process.env.REACT_APP_FEATURE ?? ''),
  webview: false,
  assets: `${process.env.PUBLIC_URL}/assets`,
  simulator: {
    music: {
      default: {
        deckId: process.env.REACT_APP_FEATURE_DECK_ID ?? '',
        musicId: process.env.REACT_APP_FEATURE_MUSIC_ID ?? '',
      },
    },
  },
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ?? '',
    scope: '',
  },
};

window.onload = function () {
  const w: any = window;
  (w.adsbygoogle = w.adsbygoogle || []).push({});
};
