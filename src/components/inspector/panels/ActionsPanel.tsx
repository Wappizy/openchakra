import { Accordion, Input, Select } from '@chakra-ui/react';
import { useSelector } from 'react-redux'
import React, { useState, useEffect, memo } from 'react'
import { getDataProviders, getAvailableAttributes, CONTAINER_TYPE } from '~utils/dataSources'
import {getModels, getModelAttributes} from '~core/selectors/dataSources'
import AccordionContainer from '~components/inspector/AccordionContainer'
import { ACTIONS } from '../../../utils/actions';
import {
  getComponents,
  getPages,
  getSelectedComponent
} from '../../../core/selectors/components';
import { useForm } from '../../../hooks/useForm'
import FormControl from '../controls/FormControl'
import usePropsSelector from '../../../hooks/usePropsSelector'


const ActionsPanel:React.FC = () => {
  const { setValueFromEvent, setValue } = useForm()
  const action = usePropsSelector('action')
  const actionProps = usePropsSelector('actionProps')
  const redirectTo = usePropsSelector('redirectTo')
  const pages = useSelector(getPages)
  const models=useSelector(getModels)
  const components=useSelector(getComponents)

  const optionsParams={pages, models, components: Object.values(components)}

  const onActionPropChange = ev => {
    const {name, value}=ev.target
    setValue('actionProps', {...actionProps, [name]: value})
  }

  const onActionChange = ev => {
    // Reset action props on action change
    //setValue('actionProps', {})
    setValueFromEvent(ev)
  }

  return (
    <Accordion >
      <AccordionContainer title="Actions">
      <FormControl htmlFor="action" label="Action">
        <Select
          id="action"
          onChange={onActionChange}
          name="action"
          size="sm"
          value={action || ''}
        >
          <option value={null}></option>
          {Object.keys(ACTIONS).map(action => (
            <option value={action}>
              {ACTIONS[action].label}
            </option>
          ))}
        </Select>
      </FormControl>
      {action && Object.keys(ACTIONS[action].options).map(k => {
        const optionValues=ACTIONS[action].options[k](optionsParams)
        return (
        <FormControl htmlFor={k} label={k}>
          <Select
            id={k}
            onChange={onActionPropChange}
            name={k}
            size="sm"
            value={actionProps[k] || ''}
          >
            <option value={null}></option>
            {optionValues.map(optionValue => (
              <option value={optionValue.key}>
                {optionValue.label}
              </option>
            ))}
          </Select>
        </FormControl>
      )})}
      {false &&
      <FormControl htmlFor="redirectTo" label="Redirect if success">
        <Select
          id="redirectTo"
          onChange={setValueFromEvent}
          name="redirectTo"
          size="sm"
          value={redirectTo || ''}
        >
          <option value={null}></option>
          {Object.values(pages).map(page => (
            <option value={page.id}>
              {page.pageName}
            </option>
          ))}
        </Select>
      </FormControl>
    }
    </AccordionContainer>
    </Accordion>
  )
}

export default memo(ActionsPanel)
