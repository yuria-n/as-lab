import Chart from 'react-apexcharts';
import React, { memo, useEffect } from 'react';

import { entities } from '@as-lab/core';

import { useGacha } from '../../hooks';

interface Props {
  gacha: entities.Gacha;
}

const rarities = Object.values(entities.Card.Rarity).reverse();

export const GachaRateGraph = memo(Component);

function Component({ gacha }: Props) {
  const { historiesMap, getHistories } = useGacha();
  const histories = historiesMap.get(gacha.id) ?? [];

  useEffect(() => {
    getHistories(gacha);
  }, [gacha]); // eslint-disable-line react-hooks/exhaustive-deps

  const state = {
    series: [
      ...rarities.map((rarity) => ({
        name: rarity,
        data: histories.map((stat) => stat.info.getCountRate(rarity)),
      })),
      ...rarities.map((rarity) => ({
        name: `${rarity} 🍈を除く`,
        data: histories.map((stat) => stat.info.getRealCountRate(rarity)),
      })),
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
        width: [5, 7, 5],
        curve: 'smooth',
        dashArray: [0, 8, 5],
      },
      legend: {
        tooltipHoverFormatter: (val: any, opts: any) =>
          val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '',
      },
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6,
        },
      },
      xaxis: {
        type: 'numeric',
        categories: histories.map((stat, i) => stat.info.count),
      },
      yaxis: {
        max: 100,
        min: 0,
      },
      grid: {
        borderColor: '#f1f1f1',
      },
    },
  };

  return <Chart options={state.options} series={state.series} type="line" height={350} />;
}
