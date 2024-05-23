import styled from 'styled-components';
import React, { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Input, InputOnChangeData, List } from 'semantic-ui-react';
import { Link } from 'react-navi';
import { entities, libs, utils } from '@as-lab/core';
import { mount, route } from 'navi';

import { Analytics, LogType } from '../../../../clients';
import { CardDialog, DeckCardDialog, DeckCards, Flex, InfeedAd, Page, ResponsiveAd } from '../../../universal';
import { DeckSimulatorFrom } from './DeckSimulatorForm';
import { HandleType, handleChange } from '../../../../utils';
import { OnClickType } from '../../../universal/cards/SchoolIdolCard';
import { Path, deckSimulatorLinks, teamNum, titleMap } from '../../../../constants';
import { config } from '../../../../config';
import { useCard, useSimulator, useUserCard } from '../../../../hooks';

export default mount({
  '/': route((req) => {
    const { w } = req.params;
    if (w) {
      config.webview = /true/.test(w);
    }
    return { view: <Component /> };
  }),
});

function Component() {
  const [deckCards, setDeckCards] = useState<libs.DeckSimulator.DeckCard[]>(new Array(teamNum * 3).fill(null));
  const [presetDeckCards, setPresetDeckCards] = useState<libs.DeckSimulator.DeckCard[]>(
    new Array(teamNum * 3).fill(null),
  );
  const [open, setOpen] = useState<OnClickType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [accTechnique, setAccTechnique] = useState(0);
  const [currentUserCards, setCurrentUserCards] = useState<entities.UserCard[]>([]);

  const simulator = useSimulator();
  const { cards, getCards } = useCard();
  const { userCards, userCardMap, presetUserCards } = useUserCard();

  useEffect(() => {
    Analytics.logEvent(LogType.VisitHome);
    getCards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const currentUserCards = simulator.presetName
      ? presetUserCards.find((preset) => preset.name === simulator.presetName)!.userCards
      : userCards;
    setCurrentUserCards(currentUserCards);
  }, [simulator.presetName, userCards, presetUserCards]);

  useEffect(() => {
    setDeckCards([...simulator.deckCards]);
  }, [simulator.deckCards, setDeckCards]);

  useEffect(() => {
    setDeckCards(presetDeckCards);
  }, [presetDeckCards]);

  const selectedCard = deckCards[selectedIndex] ?? presetDeckCards[selectedIndex];
  const charTechnique = deckCards.reduce((sum, card) => sum + (userCardMap.get(card?.cardId ?? '')?.technique ?? 0), 0);
  const totalTechnique = charTechnique + accTechnique;
  const pinned = useMemo(() => presetDeckCards.map((card) => !!card), [presetDeckCards]);

  const openDialog = useCallback(
    (index: number, type = null) => {
      setOpen(type);
      setSelectedIndex(index);
    },
    [setOpen, setSelectedIndex],
  );
  const closeDialog = useCallback(() => setOpen(null), [setOpen]);
  const handleDeckCardChange = useCallback(
    (deckCard: libs.DeckSimulator.DeckCard) => {
      closeDialog();
      setPresetDeckCards((cards) => [...cards.slice(0, selectedIndex), deckCard, ...cards.slice(selectedIndex + 1)]);
    },
    [closeDialog, setPresetDeckCards, selectedIndex],
  );
  const updateTechnique = useCallback(
    (_: SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) =>
      handleChange(HandleType.Number, setAccTechnique)(data.value),
    [setAccTechnique],
  );

  const description = (
    <>
      スキルを考慮したメイン・SP作戦のボルテージが最大になるように編成をシミュレーションします。 <br />
      このライブ編成シミュレーターでは、マイページに登録されたカードおよびキズナボードの情報が使用されます。
    </>
  );

  return (
    <Page title={title} links={deckSimulatorLinks} active={active} description={description}>
      <InfeedAd className="simulator-deck-top" slot="6692936677" />

      <strong>使い方</strong>
      <List ordered>
        <List.Item>
          <Link href={`${Path.Mypage}${Path.Card}`}>カードページ</Link>
          にてご自身のカードを登録するか、サンプルカードセットを選択します。
        </List.Item>
        <List.Item>
          <Link href={`${Path.Mypage}${Path.Kizuna}`}>キズナボードページ</Link>
          にて、各スクールアイドルのキズナボード情報を入力します。
        </List.Item>
        <List.Item>シミュレーション条件を指定します。楽曲によってはおすすめ条件設定が用意されています。</List.Item>
        <List.Item>「実行」ボタンを押すと、ページ下部に結果が表示されます。</List.Item>
      </List>

      <DeckSimulatorFrom presetDeckCards={presetDeckCards} />
      <Flex padding="1rem 0" align="stretch">
        <DeckCards userCards={currentUserCards} deckCards={deckCards} pinned={pinned} onClick={openDialog} />
      </Flex>
      <DeckCardDialog
        cardId={selectedCard?.cardId}
        team={selectedCard?.team}
        open={open === OnClickType.Select}
        deckCards={presetDeckCards}
        onChange={handleDeckCardChange}
        onClose={closeDialog}
      />
      <CardDialog
        open={open === OnClickType.Detail}
        card={useMemo(() => cards.find((card) => card.id === selectedCard?.cardId), [cards, selectedCard]) ?? null}
        userCard={useMemo(() => userCards.find((card) => card.id === selectedCard?.cardId), [userCards, selectedCard])}
        onClose={closeDialog}
      />

      <InfeedAd className="simulator-deck-bottom" slot="8861301997" />

      <Flex padding="1rem 0">
        <StyledInput
          label="テクニック合計（キャラクター）"
          type="number"
          min={0}
          max={999999}
          value={charTechnique}
          disabled
        />
        <StyledInput
          label="テクニック合計（アクセサリー）"
          type="number"
          min={0}
          max={99999}
          value={accTechnique}
          onChange={updateTechnique}
        />
        <StyledInput label="テクニック合計" value={totalTechnique} disabled />
        <StyledInput
          label="獲得予想巾着（上級）"
          type="number"
          min={0}
          max={9}
          value={utils.findLastIndex(pouchMap.high, (val) => totalTechnique >= val) + 1}
          disabled
        />
        <StyledInput
          label="獲得予想巾着（上級＋）"
          type="number"
          min={0}
          max={9}
          value={utils.findLastIndex(pouchMap.highPlus, (val) => totalTechnique >= val) + 1}
          disabled
        />
      </Flex>

      <ResponsiveAd className="simulator-deck-bottom" slot="7137866258" />

      <Flex padding="1rem 0">
        <a href="//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3562207&pid=886878996" rel="nofollow">
          <img alt="" src="//ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3562207&pid=886878996" />
          ラブライブ! サンシャイン!!（アニメイト）
        </a>
      </Flex>
    </Page>
  );
}

const StyledInput = styled(Input)`
  margin: 0.5rem;
`;

const pouchMap = {
  high: [72000, 85000, 98000],
  highPlus: [82000, 96000, 110000],
};

const title = `${titleMap[Path.Deck]}${titleMap[Path.Simulator]}`;
const active = `${Path.Simulator}${Path.Deck}`;
