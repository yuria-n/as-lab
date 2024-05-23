import React, { memo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Input } from 'semantic-ui-react';
import { FaCheck, FaEdit } from 'react-icons/fa';

import { entities, libs } from '@as-lab/core';

import { useKizuna, useSkill, useUserIdol } from '../../../../hooks';
import { Button, CancelButton, Flex, Grid, Loader } from '../../../universal';
import { getColor } from '../../../../utils';
import { IdolColorMap, uiColorMap } from '../../../../constants';

interface Props extends Pick<entities.Idol, 'id' | 'name'> {}

export const KizunaBoard = memo(Component);

function Component({ id, name }: Props) {
  const [edit, setEdit] = useState(false);
  const [userSkillFieldMap, setUserSkillFieldMap] = useState(
    new Map<entities.UserKizunaSkill['id'], entities.UserKizunaSkill['skillFields']>(),
  );

  const { kizunaSkills, getKizunaSkills } = useKizuna();
  const { userIdols, updateUserIdol } = useUserIdol();
  const { skillMap, getSkillMap } = useSkill();

  useEffect(() => {
    getKizunaSkills();
    getSkillMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (kizunaSkills.length === 0) {
      return;
    }
    const map = new Map(kizunaSkills.map((skill) => [skill.id, skill.skillFields]));
    const userKizunaSkills = userIdols.find((idol) => idol.id === id)?.kizunaSkills ?? [];
    for (const userSkill of userKizunaSkills) {
      if (userSkill.skillFields) {
        map.set(userSkill.id, [...userSkill.skillFields]);
      }
    }
    setUserSkillFieldMap(map);
  }, [kizunaSkills, userIdols]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleButtonClick = () => {
    if (edit) {
      updateUserIdol({
        id,
        kizunaSkills: Array.from(userSkillFieldMap).map(([kizunaId, skillFields]) => ({
          id: kizunaId,
          skillFields,
        })),
      });
    }
    setEdit(!edit);
  };

  return (
    <StyledDiv color={IdolColorMap[id]}>
      <Header justify="space-between" align="center">
        <IdolName>{name}</IdolName>
        <Grid columns={`repeat(${edit ? 2 : 1}, auto)`} gap="0.5rem" justifyContent="end">
          {edit && <CancelButton onClick={() => setEdit(false)} />}
          <Button onClick={handleButtonClick}>
            {edit ? <FaCheck /> : <FaEdit />}
            {edit ? '更新' : '編集'}
          </Button>
        </Grid>
      </Header>

      {skillMap.size === 0 || userSkillFieldMap.size === 0 ? (
        <Loader />
      ) : (
        <SkillList>
          {kizunaSkills.map((kizunaSkill) => {
            const fields = skillMap.get(kizunaSkill.skillId)?.fields ?? [];
            const userFields = userSkillFieldMap.get(kizunaSkill.id) ?? [];
            const value = libs.EffectSimulator.getField(fields, 'rate', userFields, 0);
            return (
              <li key={kizunaSkill.id}>
                <Flex justify="space-between" align="center">
                  <SkillTitle color={kizunaSkill.color}>{kizunaSkill.title}</SkillTitle>
                  {edit ? (
                    <Input
                      label="%"
                      labelPosition="right"
                      type="number"
                      max={100}
                      min={0}
                      value={value}
                      onChange={(_, data) => {
                        const updatedFields = libs.EffectSimulator.setField(
                          fields,
                          'rate',
                          userFields,
                          Number(data.value),
                        );
                        const map = new Map(userSkillFieldMap);
                        map.set(kizunaSkill.id, updatedFields);
                        setUserSkillFieldMap(map);
                      }}
                    />
                  ) : (
                    <SkillValue>{value}%</SkillValue>
                  )}
                </Flex>
              </li>
            );
          })}
        </SkillList>
      )}
    </StyledDiv>
  );
}

interface StyledProps {
  color: string;
}

const StyledDiv = styled.div<StyledProps>`
  position: relative;
  padding: 2rem 2rem 1.5rem;
  background: ${getColor(uiColorMap.white)};
  border-radius: 0.5rem;
  box-shadow: 0 0.1rem 0.75rem 0 ${getColor(uiColorMap.black, 700, 0.4)};
  transition: all 0.3s ease;

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0.5rem;
    border-radius: 0.5rem 0.5rem 0 0;
    background: ${({ color }) => color};
  }
`;

const Header = styled(Flex)`
  padding: 0 0 1rem 0;
  border-bottom: 1px solid ${getColor(uiColorMap.black, 900)};
`;

const IdolName = styled.h3`
  width: auto;
  margin: 0;
  padding: 0 1rem 0 0;
`;

const SkillList = styled.ul`
  margin: 0;
  padding: 1rem 0 0;
  list-style: none;
  color: ${getColor(uiColorMap.black, 300)};

  > li {
    padding: 0.25rem 0;
  }
`;

const SkillTitle = styled.p<StyledProps>`
  flex: 1;
  margin: 0 0.5rem 0 0;

  &::before {
    content: '';
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    margin: 0 0.5rem auto 0;
    border-radius: 0.25rem;
    background: ${({ color }) => color};
  }
`;

const SkillValue = styled.strong`
  font-size: 1.25rem;
  color: ${getColor(uiColorMap.black)};
`;
