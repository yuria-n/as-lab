import React, { memo } from 'react';
import styled from 'styled-components';
import { Table } from 'semantic-ui-react';

import { Grid, GridItem } from '../../universal';
import { getColor } from '../../../utils';
import { uiColorMap } from '../../../constants';

export const SimulatorDetail = memo(Component);

function Component() {
  return (
    <Grid gap="1.5rem">
      <GridItem>
        <h3>用語集</h3>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>用語</Table.HeaderCell>
              <Table.HeaderCell>説明</Table.HeaderCell>
              <Table.HeaderCell>数値</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>基本アピールとアピールの違い</Table.Cell>
              <Table.Cell>
                大きな違いはアピールは減少効果解除の対象になるのに対し、基本アピールは対象外。テクニック、スタミナも同様。
              </Table.Cell>
              <Table.Cell />
            </Table.Row>
          </Table.Body>
          <Table.Row>
            <Table.Cell>属性一致ボーナス</Table.Cell>
            <Table.Cell>
              楽曲とアイドルの属性が一致したときに得られるボーナス値。これと別途にライブの特徴の減少効果が発生する。
            </Table.Cell>
            <Table.Cell>20%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>アクセサリー属性一致ボーナス</Table.Cell>
            <Table.Cell>アクセサリーとアイドルの属性が一致したときに得られるボーナス値。</Table.Cell>
            <Table.Cell>10%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>判定ボーナス</Table.Cell>
            <Table.Cell>Wonderful/Great/Good/Bad/Miss</Table.Cell>
            <Table.Cell>20%/10%/0%/-20%/-100%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>コンボボーナス</Table.Cell>
            <Table.Cell>10/30/50/70</Table.Cell>
            <Table.Cell>1%/2%/3%/5%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>スタミナボーナス</Table.Cell>
            <Table.Cell>100%/80%/30%</Table.Cell>
            <Table.Cell>0%/-20%/-40%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ACボーナス</Table.Cell>
            <Table.Cell>AC時にボルテージが増加</Table.Cell>
            <Table.Cell>10%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SPボーナス</Table.Cell>
            <Table.Cell>SP発動後3秒間ボルテージが増加</Table.Cell>
            <Table.Cell>10%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>クリティカルボーナス</Table.Cell>
            <Table.Cell>クリティカル時ボルテージが増加</Table.Cell>
            <Table.Cell>50%</Table.Cell>
          </Table.Row>
        </Table>
      </GridItem>
      <GridItem>
        <h3>計算式</h3>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>用語</Table.HeaderCell>
              <Table.HeaderCell>説明</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>基本アピール</Table.Cell>
              <Table.Cell>
                <FeatureText>
                  （アイドルのアピール値 × パッシブ効果 × (属性一致ボーナス + キズナボードの属性一致ボーナス）+
                  同作戦のアクセのアピール値 × アクセ属性一致ボーナス）× (基本アピール増加/減少）
                </FeatureText>
                <br />
                テクニック・スタミナも同様。
                <br />
                またライブ編成スクリーン上の値は、 <br />
                アイドルのアピール値 × パッシブ効果 + 同作戦のアクセのアピール値 × アクセ属性一致ボーナス
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>アピール</Table.Cell>
              <Table.Cell>
                <FeatureText>基本アピール × 作戦効果 × (アピール増加/減少）</FeatureText>
                <br />
                テクニックも同様。スタミナは楽曲中に変動がないので、基本スタミナと同値。
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>ボルテージ</Table.Cell>
              <Table.Cell>
                <FeatureText>
                  アピール × 判定ボーナス × スタミナボーナス × ACボーナス × SPボーナス × クリティカルボーナス ×
                  基本ボルテージ増加/減少 × ボルテージ増加/減少 × 基本クリティカル値増加/減少 × クリティカル値増加/減少
                </FeatureText>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>SPボルテージ</Table.Cell>
              <Table.Cell>
                <FeatureText>
                  （アピール + テクニック × 1.2）× 基本ボルテージ増加/減少 × ボルテージ増加/減少 ×
                  基本クリティカル値増加/減少 × クリティカル値増加/減少 × SPボルテージ増加 + SPボルテージ増加系スキル
                </FeatureText>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>クリティカル発生率</Table.Cell>
              <Table.Cell>
                ３値のうちテクニックが最も高いアイドル: <FeatureText>0.003 × テクニック + 14</FeatureText>
                <br />
                それ以外: <FeatureText>0.003 × テクニック</FeatureText>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </GridItem>
    </Grid>
  );
}

const FeatureText = styled.span`
  color: ${getColor(uiColorMap.magenta)};
`;
