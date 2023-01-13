import React, { useEffect, useState } from 'react'
import lodash from 'lodash'
import util from 'util'

import { ACTIONS } from '../utils/actions'
import useDebounce from '../hooks/useDebounce.hook'

const withDynamicInput = Component => {

  const Internal = ({ dataSource, noautosave, context, backend, suggestions, setComponentValue, ...props }) => {

    let keptValue = lodash.get(dataSource, props.attribute) || ''

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

    const [internalDataValue, setInternalDataValue] = useState(keptValue)

    const debouncedValue = useDebounce(internalDataValue, 500)

    const onChange = ev => {
      const val = ev.target ? ev.target.value : ev
      if (setComponentValue) {
        setComponentValue(props.id, val)
      }
      if (noautosave) {
        setInternalDataValue(val)
      }
      if (!noautosave) {
          ACTIONS.putValue({
            context: dataSource?._id,
            value: val,
            props,
            backend,
          })
            .then(() => {
              setInternalDataValue(val)
              props.reload()
            }) //props.reload())
            .catch(err => {
              console.error(err)
              alert(err.response?.data || err)
            })
        }
    }

    if (suggestions) {
      props={...props, list: 'suggestions'}
    }

    return (
      <>
      <Component
      {...props}
      value={lodash.isNil(internalDataValue) ? '' : internalDataValue}
      onChange={onChange}
      />
      {suggestions && (
        <datalist id={`suggestions`}>
          {JSON.parse(suggestions).map(sugg => (
            <option key={sugg} value={sugg}/>
          ))}
        </datalist>
      )}
      </>
    )
  }

  return Internal
}

export default withDynamicInput
