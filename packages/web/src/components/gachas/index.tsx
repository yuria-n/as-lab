import styled from 'styled-components';
import React, { memo, useEffect, useState } from 'react';
import { Dropdown, Table } from 'semantic-ui-react';
import { TwitterIcon, TwitterShareButton } from 'react-share';
import { entities, libs } from '@as-lab/core';
import { mount, route } from 'navi';

import { Analytics, LogType } from '../../clients';
import { BadRequestError, useCard, useGacha, useIdol, useNotification } from '../../hooks';
import {
  Button,
  CardImg,
  Flex,
  Grid,
  InfeedAd,
  InputLabel,
  Modal,
  ModalContent,
  Paper,
  ResponsiveAd,
  StyledImg,
} from '../universal';
import { Display, HandleType, getCardTitle, getColor, handleChange, melonPath, round } from '../../utils';
import { GachaRateGraph } from './GachaRateGraph';
import { GachaResultPlaceholder } from './GachaResultPlaceholder';
import { GachaUrGraph } from './GachaUrGraph';
import { config } from '../../config';
import { uiColorMap } from '../../constants';

export const Gachas = memo(Component);

export default mount({
  '/': route((req) => ({
    view: <Gachas hash={req.params.h} />,
  })),
});

interface Props {
  hash?: string;
}

const delay = config.feature ? 10 : 50;
const hashTags = ['スクスタ'];

function Component({ hash }: Props) {
  const [selectedId, setSelectedId] = useState('');
  const [gacha, setGacha] = useState<entities.Gacha | null>(null);
  const [costIndex, setCostIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const [resultList, setResultList] = useState<libs.GachaSimulator.CardInfo[]>([]);
  const [maxCardId, setMaxCardId] = useState(0);
  const [link, setLink] = useState('');

  const { setError } = useNotification();
  const { cardMap, getCards } = useCard();
  const { idolMap, getIdols } = useIdol();
  const {
    gachas,
    getGachas,
    gachaDetails,
    getGachaDetails,
    statsMap,
    getStats,
    cardInfoList,
    drawGacha,
    getHistories,
  } = useGacha();

  useEffect(() => {
    Analytics.logEvent(hash ? LogType.VisitGachaFromHash : LogType.VisitGacha);
    getCards();
    getIdols();
    getGachas();
    getGachaDetails();
    return () => {
      setAuto(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedId || gachas.length === 0 || cardMap.size === 0 || gachaDetails.length === 0) {
      return;
    }
    setMaxCardId(Math.max(0, ...Array.from(cardMap.values()).map((card) => Number(card.id))));
    if (!hash) {
      return;
    }
    const { hashKey, cardIds } = libs.GachaSimulator.decodeGacha(hash);
    const gacha = gachas.find((gacha) => gacha.hashKey === hashKey);
    if (!gacha || cardIds.some((id) => !cardMap.has(id))) {
      setError(new BadRequestError('無効なURLです'));
      return;
    }
    const detailIdSet = new Set(gacha.bundles);
    const featureIdSet = new Set(
      gachaDetails.filter((detail) => detailIdSet.has(detail.id)).flatMap((detail) => detail.featureIds),
    );
    setSelectedId(gacha.id);
    setResultList(cardIds.map((id) => ({ id, count: 0, feature: featureIdSet.has(id), melon: false })));
  }, [gachas, gachaDetails, cardMap]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (auto || !gacha || resultList.length === 0 || !maxCardId) {
      return;
    }
    const hash = libs.GachaSimulator.encodeGacha(
      gacha.hashKey,
      maxCardId,
      resultList.map((card) => card.id),
    );
    const link = `${config.domain}/gachas?h=${hash}`;
    setLink(link);
  }, [auto, gacha, maxCardId, resultList]);

  useEffect(() => {
    const gacha = gachas.find((gacha) => gacha.id === selectedId) ?? null;
    if (!gacha) {
      return;
    }
    setAuto(false);
    setCostIndex(gacha.costs.length - 1);
    setLink('');
    setGacha(gacha);
  }, [selectedId, gachas]);

  useEffect(() => {
    if (!gacha) {
      return;
    }
    getStats(gacha);
    if (cardInfoList.length === 0) {
      return;
    }
    setResultList(cardInfoList);
  }, [gacha, cardInfoList]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!auto || !gacha) {
      return;
    }
    setTimeout(() => {
      drawGacha(gacha, costIndex);
    }, delay * gacha.picks[costIndex].reduce((sum, count) => sum + count));
  }, [auto, cardInfoList]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = (gacha && statsMap.get(gacha.id)) ?? null;
  useEffect(() => {
    if (!gacha || !stats) {
      return;
    }
    const { count } = stats.info;
    const threshold = Math.max(10, Math.pow(10, Math.floor(Math.log10(count))));
    if (auto && count % threshold !== 0) {
      return;
    }
    getHistories(gacha);
  }, [auto, stats]); // eslint-disable-line react-hooks/exhaustive-deps

  if (cardMap.size === 0 || idolMap.size === 0 || gachas.length === 0) {
    return null;
  }
  const titleOptions = gachas.map((gacha) => ({ value: gacha.id, text: gacha.title }));
  const costOptions = gacha
    ? gacha.costs.map((cost, index) => {
        const count = gacha.picks[index].reduce((sum, count) => sum + count);
        return { value: index, text: `${count}回 (☆${cost})` };
      })
    : [];

  const handleGachaButton = () => {
    if (!gacha) {
      return;
    }
    Analytics.logEvent(LogType.DrawGacha, { id: selectedId, cost: gacha.costs[costIndex] });
    drawGacha(gacha, costIndex);
  };

  const handleGachaAutoButton = () => {
    if (!gacha) {
      return;
    }
    if (!auto) {
      Analytics.logEvent(LogType.DrawGachaAuto, { id: selectedId, cost: gacha.costs[costIndex] });
    }
    setAuto(!auto);
  };

  const openDetailModal = (name: string, count: number) => {
    setSelectedName(name);
    setSelectedCount(count);
  };

  const closeDetailModal = () => {
    setSelectedName('');
    setSelectedCount(0);
  };

  return (
    <>
      <h2>ガチャシミュレーター</h2>
      <p>ガチャのシミュレーターです。UR取得に必要なラブカスター数の推移などを見ることができます。</p>

      <InfeedAd className="simulator-gacha-top" slot="9288677407" />

      <Grid gap="2rem">
        <Paper margin="margin: 2rem 0 2.5rem 0">
          <Grid gap="1rem">
            <Flex>
              <MenuItem flex="2">
                <InputLabel>ガチャタイトル</InputLabel>
                <Dropdown
                  name="id"
                  selection
                  value={selectedId}
                  options={titleOptions}
                  onChange={(_, data) => handleChange(HandleType.Generic, setSelectedId)(data.value)}
                />
              </MenuItem>
              <MenuItem>
                <InputLabel>回数</InputLabel>
                <Dropdown
                  name="cost"
                  selection
                  disabled={!selectedId}
                  value={costIndex}
                  options={costOptions}
                  onChange={(_, data) => handleChange(HandleType.Generic, setCostIndex)(data.value)}
                />
              </MenuItem>
            </Flex>
            <Grid columns="repeat(3, auto)" gap="0.5rem" justifyContent="start">
              <Button onClick={handleGachaButton} disabled={!selectedId}>
                ガチャを回す
              </Button>
              <Button onClick={handleGachaAutoButton} disabled={!selectedId}>
                {!auto ? '自動でガチャを回す' : '停止'}
              </Button>
              {gacha && link && (
                <TwitterShareButton title={gacha.title} url={link} hashtags={hashTags}>
                  <TwitterIcon size={30} round />
                </TwitterShareButton>
              )}
            </Grid>
          </Grid>
        </Paper>
        <Grid>
          <h3>ガチャ結果</h3>
          <Flex padding="1rem 0">
            {resultList.length > 0 ? (
              resultList.map((info, index) => {
                const card = cardMap.get(info.id)!;
                return (
                  <Flex
                    key={`${card.id}_${index}`}
                    justify="flex-start"
                    padding="0 0.5rem 0.5rem 0"
                    onClick={() =>
                      openDetailModal(getCardTitle(card, idolMap.get(card.idolId)!, Display.Name), info.count)
                    }
                  >
                    {info.feature ? <FeatImg id={card.id} /> : <CardImg id={card.id} />}
                    {info.melon && <TransparentImg src={melonPath} />}
                  </Flex>
                );
              })
            ) : (
              <GachaResultPlaceholder count={gacha ? gacha.picks[costIndex].reduce((sum, count) => sum + count) : 1} />
            )}
          </Flex>
        </Grid>
      </Grid>

      <InfeedAd className="simulator-gacha-middle" slot="5803360989" />

      {gacha && stats && (
        <Grid>
          <h3>ガチャ情報</h3>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>☆</Table.HeaderCell>
                <Table.HeaderCell>UR期待値（枚）</Table.HeaderCell>
                <Table.HeaderCell>URに必要な☆</Table.HeaderCell>
                <Table.HeaderCell>{'🍈'}を含むUR期待値（枚）</Table.HeaderCell>
                <Table.HeaderCell>UR+{'🍈'}125個に必要な☆</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {gacha.costs.map((cost, index) => {
                const expectedValue = stats.expectedValues[index];
                return (
                  <Table.Row key={`${gacha.id}_${cost}_${index}`}>
                    <Table.Cell>{cost}</Table.Cell>
                    <Table.Cell>{round(cost / expectedValue.required)}</Table.Cell>
                    <Table.Cell>{`${expectedValue.required} [${expectedValue.userRequired}]`}</Table.Cell>
                    <Table.Cell>{round(cost / expectedValue.melonRequired)}</Table.Cell>
                    <Table.Cell>{`${expectedValue.melonRequired} [${expectedValue.userMelonRequired}]`}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
          <h3>ガチャ詳細</h3>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>レア</Table.HeaderCell>
                <Table.HeaderCell>出現数</Table.HeaderCell>
                <Table.HeaderCell>出現確率</Table.HeaderCell>
                <Table.HeaderCell>出現数（{'🍈'}を除く）</Table.HeaderCell>
                <Table.HeaderCell>出現確率（{'🍈'}を除く）</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rarities.map((rarity) => {
                const { info } = stats;
                return (
                  <Table.Row key={rarity}>
                    <Table.Cell>{rarity}</Table.Cell>
                    <Table.Cell>{info.countMap[rarity]}</Table.Cell>
                    <Table.Cell>{info.getCountRate(rarity)}%</Table.Cell>
                    <Table.Cell>{info.realCountMap[rarity]}</Table.Cell>
                    <Table.Cell>{info.getRealCountRate(rarity)}%</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
          <GachaRateGraph gacha={gacha} />
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell>☆</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>UR１枚あたりの☆</Table.Cell>
                <Table.Cell>{`${stats.info.getSpentPerRealCount(entities.Card.Rarity.Ur)}`.padEnd(6, ' ')}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>UR１枚＋{'🍈'}125個あたりの☆</Table.Cell>
                <Table.Cell>
                  {`${stats.info.getSpentPerRealCountWithMelon(entities.Card.Rarity.Ur)}`.padEnd(6, ' ')}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          <GachaUrGraph gacha={gacha} />
        </Grid>
      )}

      <Modal open={selectedName.length > 0} onClose={closeDetailModal} header="カード詳細">
        <ModalContent>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>カード名</Table.HeaderCell>
                <Table.HeaderCell>総枚数</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>{selectedName}</Table.Cell>
                <Table.Cell>{selectedCount}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </ModalContent>
      </Modal>

      <ResponsiveAd className="simulator-gacha-bottom" slot="1002637087" />
    </>
  );
}

const rarities = Object.values(entities.Card.Rarity).reverse();

interface MenuItemProps {
  flex?: string;
}

const MenuItem = styled.div<MenuItemProps>`
  padding: 0 1rem 1rem 0;
  display: flex;
  flex-direction: column;
  ${({ flex }) => flex && `flex: ${flex};`}
`;

const FeatImg = styled(CardImg)`
  border: 2px solid;
  border-color: ${getColor(uiColorMap.magenta, 300)};
  border-radius: 8px;
`;

const TransparentImg = styled(StyledImg)`
  margin-left: -5rem;
  opacity: 0.6;
`;
