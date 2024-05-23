import { Analytics, LogType } from '../../../clients';
import { InfeedAd, Loader, ResponsiveAd } from '../../universal';
import React, { memo, useEffect } from 'react';
import { mount, route } from 'navi';

import { Grid } from '../../universal';
import { KizunaBoard } from './KizunaBoard';
import { MypageContainer } from '../MypageContainer';
import { Path } from '../../../constants';
import styled from 'styled-components';
import { useIdol } from '../../../hooks';

export const KizunaList = memo(Component);

export default mount({
  '/': route({
    view: <KizunaList />,
  }),
});

function Component() {
  const { idols, getIdols } = useIdol();

  useEffect(() => {
    Analytics.logEvent(LogType.VisitKizuna);
    getIdols();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (idols.length === 0) {
    return <Loader />;
  }

  return (
    <MypageContainer
      active={Path.Kizuna}
      description={
        <>
          各キャラクターのキズナで上昇した効果の値を管理します。
          <br />
          入力する値は、スクスタのエピソード &gt; キャラクター &gt; キズナボード &gt; キズナ効果で確認できます。
        </>
      }
    >
      <InfeedAd className="mypage-kizuna-top" slot="1268385450" />

      <StyledGrid gap="1rem">
        {idols.map((idol) => (
          <KizunaBoard key={idol.id} id={idol.id} name={idol.name} />
        ))}
      </StyledGrid>

      <ResponsiveAd className="mypage-kizuna-bottom" slot="3437228738" />
    </MypageContainer>
  );
}

const StyledGrid = styled(Grid)`
  grid-template-columns: 1fr;

  @media only screen and (min-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
