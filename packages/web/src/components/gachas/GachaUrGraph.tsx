import Chart from 'react-apexcharts';
import React, { memo, useEffect } from 'react';

import { entities } from '@as-lab/core';

import { useGacha } from '../../hooks';

interface Props {
  gacha: entities.Gacha;
}

export const GachaUrGraph = memo(Component);

function Component({ gacha }: Props) {
  const { historiesMap, getHistories } = useGacha();
  const histories =
    historiesMap.get(gacha.id)?.filter((stat) => stat.info.countMap[entities.Card.Rarity.Ur] !== 0) ?? [];

  useEffect(() => {
    getHistories(gacha);
  }, [gacha]); // eslint-disable-line react-hooks/exhaustive-deps

  const state = {
    series: [
      {
        name: 'UR一枚あたりの☆',
        data: histories.map((stat) => stat.info.getSpentPerRealCount(entities.Card.Rarity.Ur)),
      },
      {
        name: 'UR１枚＋🍈125個あたりの☆',
        data: histories.map((stat) => stat.info.getSpentPerRealCountWithMelon(entities.Card.Rarity.Ur)),
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
      grid: {
        borderColor: '#f1f1f1',
      },
    },
  };

  return <Chart options={state.options} series={state.series} type="line" height={350} />;
}
