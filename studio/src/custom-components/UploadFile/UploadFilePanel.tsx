import React, { memo } from 'react'
import SwitchControl from '~components/inspector/controls/SwitchControl'
import usePropsSelector from '~hooks/usePropsSelector'
import TextControl from '~components/inspector/controls/TextControl'

const UploadFilePanel = () => {
  
  const noticemsg = usePropsSelector('notifmsg')
  const previewmsg = usePropsSelector('previewmsg')
  const preview = usePropsSelector('preview')

  return (
    <>
      <SwitchControl label="Confirmation Message" name="notifmsg" />
      {noticemsg && <TextControl name="okmsg" label="OK message" />}

      <SwitchControl label="Preview Message" name="previewmsg" />
      {previewmsg && <TextControl name="prvmsg" label="Preview message" />}

      <SwitchControl label="Preview" name="preview" />
      {previewmsg && <TextControl name="prv" label="Preview" />}
    </>
  )
}

export default memo(UploadFilePanel)
