import React, { memo } from 'react';
import Chart from 'react-apexcharts';

import { entities } from '@as-lab/core';

import { Grid, GridItem } from '../../universal';
import { getColor, roundRate } from '../../../utils';
import { SimulationResult } from '../../../repositories';
import { uiColorMap } from '../../../constants';

export const SimpleResultView = memo(Component);

interface Props {
  liveStage: entities.Music.LiveStage;
  results: SimulationResult[];
}

/**
 * @see https://istat.co.jp/sk_commentary/percentile
 */
function toPercentile(sorted: Value[], p: Rate) {
  const k = (sorted.length + 1) * p;
  const q = Math.floor(k);
  const r = k % 1;
  const d1 = sorted[q];
  const d2 = sorted[q + 1];
  return Math.floor(d1 + (d2 - d1) * r);
}

function Component({ liveStage, results }: Props) {
  const { targetVoltage } = liveStage;
  const scores = results.map((result) => result.status.totalVoltage).sort((n1, n2) => n1 - n2);
  const sRate = scores.reduce((count, score) => count + Number(score >= targetVoltage), 0) / results.length;
  const p50 = toPercentile(scores, 0.5);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  const max = Math.max(targetVoltage, maxScore);
  const min = Math.min(targetVoltage, minScore);
  const size = Math.max(results.length, 100);
  const diff = (max - min) / (size - 1);
  const xaxis = Array.from({ length: size }, (_, index) => min + diff * index);
  const data = Array.from(xaxis, () => 0);
  for (const score of scores) {
    const index = Math.round((score - min) / diff);
    if (index < 0 || index >= data.length) {
      console.error('Invalid index', { index });
      continue;
    }
    data[index]++;
  }
  const state = {
    series: [
      {
        name: '出現回数',
        data,
      },
    ],
    options: {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 2,
        curve: 'smooth',
        colors: [getColor(uiColorMap.cyan)],
      },
      xaxis: {
        type: 'numeric',
        categories: xaxis,
      },
      annotations: {
        xaxis: [
          {
            x: targetVoltage,
            borderColor: getColor(uiColorMap.cyan),
            fillColor: getColor(uiColorMap.cyan),
            label: {
              text: 'Sランク',
            },
          },
        ],
      },
    },
  };
  return (
    <Grid gap="1.5rem">
      <GridItem>
        <p>中央値: {p50.toLocaleString()}</p>
        <p>Sランクボルテージ: {targetVoltage.toLocaleString()}</p>
        <p>Sランク確率: {roundRate(sRate)}％</p>
      </GridItem>
      <GridItem>
        <Chart options={state.options} series={state.series} type="line" />
      </GridItem>
    </Grid>
  );
}
