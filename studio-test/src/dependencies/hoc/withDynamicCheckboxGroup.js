import { Radio, Flex } from '@chakra-ui/react'
import React, {useState} from 'react'
import lodash from 'lodash'

import { ACTIONS } from '../utils/actions'

const withDynamicCheckboxGroup = Component => {

  const Internal = ({children, noautosave, ...props}) => {
    const dataSource=props.dataSource
    const enumValues=props.enum ? JSON.parse(props.enum) : null
    const computed = props.dataSource ? lodash.get(props.dataSource, props.attribute).map(v => lodash.isObject(v) ? v._id : v) : []
    const [internalValue, setInternalValue] = useState(computed)
    // TODO: set comp value because value store in the component is not recognized as an array
    // props.setComponentValue && props.setComponentValue(props.id, computed)

    const onChange = evValue => {
      setInternalValue(evValue)
      props.setComponentValue && props.setComponentValue(props.id, evValue)

      if (!noautosave) {
        ACTIONS.putValue({
          context: dataSource?._id,
          value: evValue,
          props,
        })
        .then(() => props.reload())
        .catch(err => console.error(err))
      }
    }

    return (
      <div {...props} key={internalValue} value={internalValue}>
      <Component {...props} id={undefined} onChange={onChange} value={internalValue}>
        {enumValues ?
          <Flex flexDirection={props.flexDirection} justifyContent={props.justifyContent}>
          {
            Object.keys(enumValues).map((k, idx) => <Flex flexDirection='row'><Radio value={k} />{enumValues[k]}</Flex>)
          }
          </Flex>
          :null
        }
        <div>{children}</div>
      </Component>
      </div>
    )
  }

  return Internal
}

export default withDynamicCheckboxGroup
