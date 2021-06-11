import React from 'react'
import { Participant } from '../core/battle-types'
import { UnitType } from '../core/unit'
import UnitInput from './unitInput'

interface Props {
  unitType: UnitType
  attacker: Participant
  onChangeAttacker: (participant: Participant) => void
  defender: Participant
  onChangeDefender: (participant: Participant) => void
}

export default function UnitRow({
  unitType,
  attacker,
  onChangeAttacker,
  defender,
  onChangeDefender,
}: Props) {
  return (
    <div style={{ display: 'flex' }}>
      <UnitInput
        participant={attacker}
        unitType={unitType}
        onUpdate={onChangeAttacker}
        style={{ flex: '1 0 0' }}
      />
      <div id={unitType} style={{ flex: '1 0 0', textAlign: 'center', paddingTop: '10px' }}>
        {unitType}
      </div>
      <UnitInput
        participant={defender}
        unitType={unitType}
        onUpdate={onChangeDefender}
        style={{ flex: '1 0 0' }}
      />
    </div>
  )
}
