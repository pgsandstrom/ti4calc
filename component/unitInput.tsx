import React from 'react'
import { Participant } from '../core/battle-types'
import { getUnitUpgrade } from '../core/battleeffect/unitUpgrades'
import { UnitType } from '../core/unit'
import NumberInput from './numberInput'

interface UnitInputProps {
  participant: Participant
  unitType: UnitType
  onUpdate: (participant: Participant) => void
  style?: React.CSSProperties
}

export default function UnitInput({ participant, unitType, onUpdate, style }: UnitInputProps) {
  const unitUpgrade = getUnitUpgrade(participant.race, unitType)

  const updateUnitCount = (newVal: number) => {
    const newParticipant: Participant = {
      ...participant,
      units: {
        ...participant.units,
        [unitType]: newVal,
      },
    }
    onUpdate(newParticipant)
  }

  const hasUpgrade = participant.unitUpgrades[unitType] ?? false

  const numberInput = (
    <NumberInput
      currentValue={participant.units[unitType]}
      onUpdate={updateUnitCount}
      aria-labelledby={unitType}
      style={{ flex: '1 0 auto', width: '0px' }}
    />
  )

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        height: '48px',
      }}
    >
      {/* We insert numberInput like this instead of using flex row-reverse due to tab index order */}
      {participant.side === 'defender' && numberInput}
      <input
        autoComplete="off"
        title="Upgrade"
        type="checkbox"
        disabled={!unitUpgrade}
        checked={hasUpgrade}
        onChange={() => {
          const newParticipant: Participant = {
            ...participant,
            unitUpgrades: {
              ...participant.unitUpgrades,
              [unitType]: !hasUpgrade,
            },
          }
          onUpdate(newParticipant)
        }}
        aria-labelledby={unitType}
        style={{
          width: '24px',
          height: '24px',
          marginTop: '12px',
          marginLeft: participant.side === 'defender' ? '10px' : undefined,
          marginRight: participant.side === 'attacker' ? '10px' : undefined,
          visibility: unitUpgrade ? undefined : 'hidden',
        }}
      />
      {participant.side === 'attacker' && numberInput}
    </div>
  )
}
