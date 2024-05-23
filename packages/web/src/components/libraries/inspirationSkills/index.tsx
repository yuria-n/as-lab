import styled from 'styled-components';
import React, { memo, useEffect, useState } from 'react';
import { Image, Table } from 'semantic-ui-react';
import { entities, masters, utils } from '@as-lab/core';

import { Analytics, LogType } from '../../../clients';
import { InfeedAd, SearchInput, SearchInputItem } from '../../universal';
import { TemplateInput } from '../../universal/skills';
import { config } from '../../../config';
import { placeTextMap, rarityImageMap } from '../../../constants';
import { useCondition, useInspirationSkill, useSkill } from '../../../hooks';

type Skill = entities.InspirationSkill & { skill: entities.Skill };

const debug = config.feature && false;
const conditionOrderMap = new Map(Object.values(entities.Condition.Type).map((value, index) => [value, index]));
const effectOrderMap = new Map(Object.values(entities.SkillEffect).map((value, index) => [value, index]));
const rankOrderMap = new Map(Object.values(entities.InspirationSkill.Rank).map((value, index) => [value, index]));
const rarityOrderMap = new Map(Object.values(entities.InspirationSkill.Rarity).map((value, index) => [value, index]));
const targetOrderMap = new Map(Object.values(entities.SkillTarget).map((value, index) => [value, index]));

export const InspirationSkills = memo(Component);

function Component() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchItems, setSearchItems] = useState<SearchInputItem<Skill>[]>([]);
  const { conditions, getConditions } = useCondition();
  const { inspirationSkills, getInspirationSkills } = useInspirationSkill();
  const { skillMap, getSkillMap, masterSkills, getMasterSkills } = useSkill();

  useEffect(() => {
    Analytics.logEvent(LogType.VisitLibraryInspirationSkill);
    getSkillMap();
    getConditions();
    getMasterSkills();
    getInspirationSkills();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (skillMap.size === 0 || conditions.length === 0 || masterSkills.length === 0) {
      return;
    }
    const skills = inspirationSkills
      .filter((skill) => debug || skill.places.length)
      .map((data) => ({
        ...data,
        skill: skillMap.get(data.skillId)!,
      }))
      .sort(
        (s1, s2) =>
          effectOrderMap.get(s1.skill.effect)! - effectOrderMap.get(s2.skill.effect)! ||
          rarityOrderMap.get(s1.rarity)! - rarityOrderMap.get(s2.rarity)! ||
          Number(s1.skillFields[0]) - Number(s2.skillFields[0]) ||
          Number(s1.skillFields[1]) - Number(s2.skillFields[1]) ||
          conditionOrderMap.get(s1.skill.condition)! - conditionOrderMap.get(s2.skill.condition)! ||
          targetOrderMap.get(s1.skill.target)! - targetOrderMap.get(s2.skill.target)! ||
          rankOrderMap.get(s1.rank)! - rankOrderMap.get(s2.rank)!,
      )
      .map((s) => {
        const master = masterSkillMap.get(s.skill.effect)!;
        const target = masters.skillTargetTitleMap[s.skill.target];
        const condition = conditionMap.get(s.skill.condition)!;
        return {
          item: s,
          searchTexts: [
            s.id,
            ...s.places.flatMap((place) => [place, placeTextMap[place]]),
            master.effect,
            master.slug,
            master.title,
            master.description,
            s.skill.target,
            target,
            condition.type,
            condition.title,
            condition.description,
          ],
        };
      });
    setSearchItems(skills);
  }, [inspirationSkills, skillMap, conditions, masterSkills]); // eslint-disable-line react-hooks/exhaustive-deps

  const conditionMap = new Map(conditions.map((condition) => [condition.type, condition]));
  const masterSkillMap = new Map(masterSkills.map((skill) => [skill.effect, skill]));
  const skillsMap = utils.groupBy(skills, (s) => s.skill.effect);
  return (
    <>
      <SearchInput items={searchItems} onChange={setSkills} />
      {Array.from(skillsMap).map(([effect, list]) => {
        const hasTitle = list.some((s) => s.title);
        const hasCondition = list.some((s) => conditionMap.get(s.skill.condition)?.description);
        return (
          <>
            <InfeedAd className="infeed-libary-inspiration-skills" slot="3301003493" />

            <h3 key={effect}>{masterSkillMap.get(effect)!.slug}</h3>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  {debug && <Table.HeaderCell>ID</Table.HeaderCell>}
                  <Table.HeaderCell>レア</Table.HeaderCell>
                  {hasTitle && <Table.HeaderCell>タイトル</Table.HeaderCell>}
                  {hasCondition && <Table.HeaderCell>条件</Table.HeaderCell>}
                  <Table.HeaderCell>対象</Table.HeaderCell>
                  <Table.HeaderCell>効果</Table.HeaderCell>
                  <Table.HeaderCell>習得場所</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {list.map((s) => {
                  const condition = conditionMap.get(s.skill.condition)!;
                  return (
                    <Table.Row key={s.id}>
                      {debug && <Table.Cell>{s.id}</Table.Cell>}
                      <Table.Cell>
                        <StyledImage src={rarityImageMap[s.rarity]} />
                      </Table.Cell>
                      {hasTitle && <Table.Cell>{s.title}</Table.Cell>}
                      {hasCondition && (
                        <Table.Cell>
                          <TemplateInput
                            template={condition.description}
                            fields={condition.fields}
                            values={s.conditionFields}
                          />
                        </Table.Cell>
                      )}
                      <Table.Cell>{masters.skillTargetTitleMap[s.skill.target]}</Table.Cell>
                      <Table.Cell>
                        <TemplateInput template={s.skill.description} fields={s.skill.fields} values={s.skillFields} />
                      </Table.Cell>
                      <Table.Cell>{s.places.map((place) => placeTextMap[place]).join('、')}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </>
        );
      })}
    </>
  );
}

const StyledImage = styled(Image)`
  width: 1.5rem;
`;
