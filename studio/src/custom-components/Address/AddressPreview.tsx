import React from 'react'
import { useDropComponent } from '~hooks/useDropComponent'
import { useInteractive } from '~hooks/useInteractive'
import { Box } from '@chakra-ui/react'
import Address from '~dependencies/custom-components/Address'

const AddressPreview: React.FC<IPreviewProps> = ({ component }) => {

  const { drop, isOver } = useDropComponent(component.id)
  const { props, ref } = useInteractive(component, true)

  if (isOver) {
    props.bg = 'teal.50'
  }

  return (
    <Box pos="relative" ref={drop(ref)} {...props}>
      <Address ref={drop(ref)} {...props} />
    </Box>
  )
}

export default AddressPreview