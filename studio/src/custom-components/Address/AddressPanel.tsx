import React, { memo } from 'react'
import SwitchControl from '~components/inspector/controls/SwitchControl'

const AddressPanel = () => {

  return (
    <>
      <SwitchControl name='isCityOnly' label='City only' />
      <SwitchControl name='readOnly' label='Read only' />
    </>
  )
}

export default memo(AddressPanel)