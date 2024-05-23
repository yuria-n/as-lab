import React, { useEffect } from 'react';
import { mount, route } from 'navi';

import { Analytics, LogType } from '../../clients';
import { config } from '../../config';

export default mount({
  '/': route((req) => {
    const { h, f, w } = req.params;
    if (config.event.replace(/=/g, '') === h) {
      localStorage.setItem(config.event, '1');
    }
    if (f) {
      config.feature = /true/.test(f);
    }
    if (w) {
      config.webview = /true/.test(w);
    }
    return {
      view: <About />,
    };
  }),
});

export function About() {
  useEffect(() => {
    Analytics.logEvent(LogType.VisitAbout);
  }, []);
  return (
    <>
      <h2>当サイトについて</h2>
      <p>
        当サイトは趣味で運営しているラブライブ スクールアイドルフェスティバルall
        stars（以下「スクスタ」）非公式のファンサイトです。スクスタをより楽しむために、デッキのシミュレーションを始めとした機能を提供しています。
        より利用者が楽しむことができるよう、利用者がカード情報・ひらめきスキル情報の登録リクエスト（以下「リクエスト」）を行うことができます。リクエストを行うためにGoogleアカウントを利用してログインする必要があります。{' '}
      </p>

      <h3>免責事項</h3>
      <p>
        利用者が当サイトを利用して得られた情報等についていかなる保証をするものではなく、何らの責任を負うものではありません。万が一、利用者に何らかの不都合や損害が発生したとしても、当管理人が何らの責任を負うものではありません。{' '}
      </p>

      <h3>プライバシーポリシー</h3>
      <p>
        本サイトではリクエストを行うためにGoogleアカウントによるログインを利用しています。このときに自動発行される固有IDはリクエストを行うためのみに使用され、その他の目的で使用されることはありません。
      </p>

      <h3>お問い合わせ</h3>
      <p>不具合等発見されましたらTwitterにてご連絡ください。</p>
      <p>
        <a href="https://twitter.com/lovelivelab" rel="noopener noreferrer" target="_blank">
          @lovelivelab
        </a>
      </p>
    </>
  );
}
