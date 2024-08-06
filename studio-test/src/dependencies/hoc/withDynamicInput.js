import React, { useState, useEffect } from 'react'
import lodash from 'lodash'
import {InputGroup, InputRightElement} from '@chakra-ui/react'
import {AiOutlineEye, AiOutlineEyeInvisible} from 'react-icons/ai'
import { ACTIONS } from '../utils/actions'

const withDynamicInput = Component => {

  const Internal = ({ isfilter, dataSource, dataSourceId, noautosave, readOnly, context, suggestions, setComponentValue, displayEye, clearComponents, ...props }) => {

    let keptValue = (dataSourceId && lodash.get(dataSource, props.attribute)) || props.value

    const isADate = !isNaN(Date.parse(keptValue)) && new Date(Date.parse(keptValue));

    if (isADate instanceof Date) {

      const retainedDate = isADate.toLocaleString(undefined, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'})
        .split(/\s/)
      const transformedDate = `${retainedDate[0].split('/').reverse().join('-')}T${retainedDate[1]}`

      if (props?.type === 'datetime-local') {
          keptValue = transformedDate.slice(0, 16)
      }
      if (props?.type === 'date') {
        keptValue = transformedDate.slice(0, 10)
      }
      if (props?.type === 'time') {
          keptValue = transformedDate.slice(11, 16)
      }
    }

    useEffect(() => {
      if (!!props.model && clearComponents.includes(props.id)) {
        console.log(`Clear ${props.id} contents`)
        setInternalDataValue('')
      }
    }, [clearComponents])
    const [internalDataValue, setInternalDataValue] = useState(keptValue)
    const [visibilityType, setVisibilityType]= useState('password')

    const onChange = ev => {
      const val = ev.target ? ev.target.value : ev
      setInternalDataValue(val)
      if (!readOnly && !noautosave && dataSourceId) {
          ACTIONS.putValue({
            context: dataSource?._id,
            value: val,
            props,
          })
            .catch(err => {
              console.error(err)
              if (!(err.response?.status==401) && err.code!='ERR_NETWORK') {
                console.log(err.response?.data || err)
              }
            })
        }
    }

    props={...props, readOnly, value:lodash.isNil(internalDataValue) ? '' : internalDataValue}

    if (isfilter) {
      props.onBlur=props.reload
    }

    if (suggestions) {
      props={...props, list: 'suggestions'}
    }
    if (displayEye) {
      props={...props, type:visibilityType}
    }

    const withDisplayEye = Comp =>  {

      const toggleSecret = () => {
        setVisibilityType(visibilityType=='password' ? 'text' : 'password')
      }

      const parentProps=lodash.pick(props, 'id dataSource name dataSourceId value level model attribute noautosave readOnly context setComponentValue'.split(' '))

      return displayEye ? (
        <InputGroup {...parentProps}>
        <Component
        {...lodash.omit(props, ['id'])}
        onChange={onChange}
        />
        {suggestions && (
          <datalist id={`suggestions`}>
            {JSON.parse(suggestions).map(sugg => (
              <option key={sugg} value={sugg}/>
            ))}
          </datalist>
        )}
        {displayEye &&
          <InputRightElement>
            {visibilityType=='password' ?
            <AiOutlineEye onClick={toggleSecret} title='Afficher le mot de passe'/>
            :
            <AiOutlineEyeInvisible onClick={toggleSecret} title='Masquer le mot de passe'/>
          }
          </InputRightElement>}
        </InputGroup>
      )
      :
      (<Component {...props} onChange={onChange} />)
    }

    return displayEye ?
      withDisplayEye(Component)
      :
      <Component {...props} dataSource={dataSource} onChange={onChange} />
  }

  return Internal
}

export default withDynamicInput
