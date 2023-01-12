import { Select, Checkbox } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import React, { memo } from 'react'
import { getModelNames } from '~core/selectors/dataSources'
import { useForm } from '../../hooks/useForm'
import FormControl from '../../components/inspector/controls/FormControl'
import usePropsSelector from '../../hooks/usePropsSelector'

const capitalize = (word: string) => {
  return word.replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase()))
}

const DataProviderPanel = () => {
  const { setValueFromEvent, setValue, removeValue } = useForm()
  const model = usePropsSelector('model')
  const cardinality = usePropsSelector('cardinality')
  const ignoreUrlParams = usePropsSelector('ignoreUrlParams')
  const modelNames = useSelector(getModelNames)

  const setIgnoreUrlParams = (event:React.ChangeEvent<HTMLInputElement>) => {
    setValue('ignoreUrlParams', event.target.checked)
  }

  const onModelChange = (ev:React.ChangeEvent<HTMLSelectElement>) => {
    const {value}=ev.target
    setValueFromEvent(ev)
    if (!value) {
      removeValue('cardinality')
    }
  }

  const cbLabel = `Ignore '${model}' param in URL`
  return (
    <>
      <FormControl htmlFor="model" label="Model">
        <Select
          id="model"
          onChange={onModelChange}
          name="model"
          size="sm"
          value={model || ''}
        >
          <option value={undefined}></option>
          {modelNames.map((mdl, i) => (
            <option key={`datm${i}`} value={mdl}>
              {capitalize(mdl)}
            </option>
          ))}
        </Select>
      </FormControl>
      {model && (
        <FormControl htmlFor="ignoreUrlParams" label={cbLabel}>
          <Checkbox
            id="ignoreUrlParams"
            name="ignoreUrlParams"
            isChecked={ignoreUrlParams}
            onChange={setIgnoreUrlParams}
          ></Checkbox>
        </FormControl>
      )}
      {model && <FormControl htmlFor="model" label="Page requires">
        <Select
          id="cardinality"
          onChange={setValueFromEvent}
          name="cardinality"
          size="sm"
          value={cardinality || ''}
        >
          <option value={undefined}></option>
          <option value={'single'}>single data</option>
          <option value={'multiple'}>multiple data</option>
        </Select>
      </FormControl>
      }
    </>
  )
}

export default memo(DataProviderPanel)
