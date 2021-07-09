import React, { useState } from 'react'
import styled from 'styled-components'
import { Participant } from '../core/battle-types'
import { getActioncards } from '../core/battleeffect/actioncard'
import { getAgendas } from '../core/battleeffect/agenda'
import {
  BattleEffect,
  getOtherBattleEffects,
  isBattleEffectRelevant,
  isBattleEffectRelevantForSome,
} from '../core/battleeffect/battleEffects'
import { getTechBattleEffects } from '../core/battleeffect/tech'
import {
  getGeneralEffectFromRaces,
  getRaceStuffNonUnit,
  getPromissary,
  getAgent,
  getCommanders,
} from '../core/races/race'
import ArrowSvg from './arrowSvg'
import CoolButton from './coolButton'
import DamagedUnitsView from './damagedUnitsView'
import NumberInput from './numberInput'
import { OptionsRowView } from './optionsRowView'

interface OptionsProps {
  attacker: Participant
  attackerOnChange: (participant: Participant) => void
  defender: Participant
  defenderOnChange: (participant: Participant) => void
  style?: React.CSSProperties
}

const StyledCheckbox = styled.input`
  height: 24px;
  width: 24px;
`

const filterOutBattleEffects = (
  effects: BattleEffect[],
  attacker: Participant,
  defender: Participant,
) => {
  return effects.filter((effect) => {
    return isBattleEffectRelevantForSome(effect, [attacker, defender])
  })
}

export default function OptionsView(props: OptionsProps) {
  const otherBattleEffects = filterOutBattleEffects(
    [...getOtherBattleEffects(), ...getGeneralEffectFromRaces()],
    props.attacker,
    props.defender,
  )
  const techs = filterOutBattleEffects(getTechBattleEffects(), props.attacker, props.defender)
  const raceTechs = filterOutBattleEffects(getRaceStuffNonUnit(), props.attacker, props.defender)
  const promissary = filterOutBattleEffects(getPromissary(), props.attacker, props.defender)
  const agents = filterOutBattleEffects(getAgent(), props.attacker, props.defender)
  const commanders = filterOutBattleEffects(getCommanders(), props.attacker, props.defender)
  const actioncards = filterOutBattleEffects(getActioncards(), props.attacker, props.defender)
  const agendas = filterOutBattleEffects(getAgendas(), props.attacker, props.defender)

  const [show, setShow] = useState(false)

  return (
    <div
      style={{
        ...props.style,
        background: 'white',
        borderRadius: '5px',
        padding: '5px',
      }}
    >
      <CoolButton onClick={() => setShow(!show)} style={{ padding: '10px' }}>
        <div style={{ display: 'flex' }}>
          <span>Options</span>
          <ArrowSvg
            style={{
              width: '16px',
              height: '16px',
              marginLeft: '5px',
              transform: show ? 'scaleY(-1)' : undefined,
            }}
          />
        </div>
      </CoolButton>
      {show && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '20px',
          }}
        >
          <OptionsRowView
            left={getDirectHitCheckbox(props.attacker, props.attackerOnChange)}
            right={getDirectHitCheckbox(props.defender, props.defenderOnChange)}
            name="Risk direct hit"
            description="If units with SUSTAIN DAMAGE should be assigned the first hits. Direct hit can only be played in space combat, so ground combat is not affected."
          />
          <DamagedUnitsView {...props} />
          <OptionsPartView title="Tech" battleEffects={techs} {...props} />
          <OptionsPartView title="Race specific" battleEffects={raceTechs} {...props} />
          <OptionsPartView title="Promissary note" battleEffects={promissary} {...props} />
          <OptionsPartView title="Agent" battleEffects={agents} {...props} />
          <OptionsPartView title="Commander" battleEffects={commanders} {...props} />
          <OptionsPartView title="Action card" battleEffects={actioncards} {...props} />
          <OptionsPartView title="Agenda" battleEffects={agendas} {...props} />
          <OptionsPartView title="Other" battleEffects={otherBattleEffects} {...props} />
        </div>
      )}
    </div>
  )
}

interface OptionsPartProps {
  title?: string
  battleEffects: BattleEffect[]
  attacker: Participant
  attackerOnChange: (participant: Participant) => void
  defender: Participant
  defenderOnChange: (participant: Participant) => void
}

function OptionsPartView({
  title,
  battleEffects,
  attacker,
  attackerOnChange,
  defender,
  defenderOnChange,
}: OptionsPartProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {title !== undefined && <h2 style={{ textAlign: 'center' }}>{title}</h2>}
      {battleEffects.map((effect) => {
        const attackerView = (
          <BattleEffectInput
            effect={effect}
            participant={attacker}
            onUpdate={attackerOnChange}
            otherParticipant={defender}
            onOtherUpdate={defenderOnChange}
          />
        )
        const defenderView = (
          <BattleEffectInput
            effect={effect}
            participant={defender}
            onUpdate={defenderOnChange}
            otherParticipant={attacker}
            onOtherUpdate={attackerOnChange}
          />
        )
        return (
          <OptionsRowView
            key={effect.name}
            left={attackerView}
            right={defenderView}
            name={effect.name}
            description={effect.description}
          />
        )
      })}
    </div>
  )
}

const getDirectHitCheckbox = (
  participant: Participant,
  onChange: (participant: Participant) => void,
) => {
  return (
    <StyledCheckbox
      autoComplete="off"
      type="checkbox"
      checked={participant.riskDirectHit}
      onChange={() => {
        const newParticipant: Participant = {
          ...participant,
          riskDirectHit: !participant.riskDirectHit,
        }
        onChange(newParticipant)
      }}
    />
  )
}

interface BattleEffectInputProps {
  effect: BattleEffect
  participant: Participant
  onUpdate: (participant: Participant) => void
  otherParticipant: Participant
  onOtherUpdate: (participant: Participant) => void
}

const BattleEffectInput = ({
  effect,
  participant,
  onUpdate,
  otherParticipant,
  onOtherUpdate,
}: BattleEffectInputProps) => {
  if (effect.count !== undefined) {
    const updateEffectCount = (newVal: number) => {
      const newParticipant: Participant = {
        ...participant,
        ...participant.units,
        battleEffects: {
          ...participant.battleEffects,
          [effect.name]: newVal,
        },
      }
      onUpdate(newParticipant)
    }

    const disabled = !isBattleEffectRelevant(effect, participant)
    return (
      <NumberInput
        currentValue={participant.battleEffects[effect.name] ?? 0}
        onUpdate={updateEffectCount}
        style={{ width: '100%', visibility: disabled ? 'hidden' : undefined }}
      />
    )
  }
  const battleEffectCount = participant.battleEffects[effect.name]

  const updateParticipant = (
    p: Participant,
    checked: boolean,
    onUpdate: (p: Participant) => void,
  ) => {
    const newParticipant: Participant = {
      ...p,
      battleEffects: {
        ...p.battleEffects,
        [effect.name]: checked ? 1 : 0,
      },
    }
    onUpdate(newParticipant)
  }

  const disabled = !isBattleEffectRelevant(effect, participant)
  return (
    <StyledCheckbox
      autoComplete="off"
      type="checkbox"
      checked={battleEffectCount !== undefined && battleEffectCount > 0}
      onChange={(e) => {
        updateParticipant(participant, e.target.checked, onUpdate)
        if (effect.symmetrical) {
          updateParticipant(otherParticipant, e.target.checked, onOtherUpdate)
        }
      }}
      style={{
        visibility: disabled ? 'hidden' : undefined,
      }}
    />
  )
}
