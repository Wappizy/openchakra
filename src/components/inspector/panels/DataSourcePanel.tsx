import { Select } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import React, { useState, useEffect, memo } from 'react'
import { Input } from '@chakra-ui/react'
import { Accordion } from '@chakra-ui/react'
import AccordionContainer from '~components/inspector/AccordionContainer'

import { getDataProviders, getAvailableAttributes, CONTAINER_TYPE } from '~utils/dataSources'
import {
  getComponents,
  getSelectedComponent
} from '../../../core/selectors/components';
import { useForm } from '../../../hooks/useForm'
import FormControl from '../controls/FormControl'
import usePropsSelector from '../../../hooks/usePropsSelector'
import {getModels, getModelAttributes} from '~core/selectors/dataSources'


const DataSourcePanel:React.FC = () => {
  const components:IComponents = useSelector<IComponents>(getComponents)
  const activeComponent:IComponent = useSelector<IComponent>(getSelectedComponent)
  const { setValueFromEvent } = useForm()
  const dataSource = usePropsSelector('dataSource')
  const attribute = usePropsSelector('attribute')
  const limit = usePropsSelector('limit')
  const [providers, setProviders] = useState<IComponent[]>([])
  const provider = providers.find(p => p.id == dataSource)
  const [attributes, setAttributes] = useState([])
  const models = useSelector(getModels)

  useEffect(() => {
    const dataProviders = getDataProviders(activeComponent, components)
    setProviders(dataProviders)
    if (models.length>0) {
      const attrs=getAvailableAttributes(activeComponent, components, models)
      setAttributes(attrs)
    }
  }, [activeComponent, components, dataSource, models])

  return (
    <Accordion >
        <AccordionContainer title="Data source">
      <FormControl htmlFor="dataSource" label="Datasource">
        <Select
          id="dataSource"
          onChange={setValueFromEvent}
          name="dataSource"
          size="sm"
          value={dataSource || ''}
        >
          <option value={null}></option>
          {providers.map(provider => (
            <option value={provider.id}>
              {`${provider.id} (${provider.props?.model})`}
            </option>
          ))}
        </Select>
      </FormControl>
      {attributes && (
        <FormControl htmlFor="attribute" label="Champ">
          <Select
            id="attribute"
            onChange={setValueFromEvent}
            name="attribute"
            size="sm"
            value={attribute || ''}
          >
            <option value={null}></option>
            {Object.keys(attributes).map(attribute => (
              <option value={attribute}>{attribute}</option>
            ))}
          </Select>
        </FormControl>
      )}
      {CONTAINER_TYPE.includes(activeComponent?.type) && (
        <FormControl htmlFor="limit" label="Limit">
          <Input
            id="limit"
            name="limit"
            size="sm"
            value={limit}
            type="number"
            onChange={setValueFromEvent}
          />
        </FormControl>
      )}

    </AccordionContainer>
    </Accordion>
  )
}

export default memo(DataSourcePanel)
