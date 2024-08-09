// @ts-nocheck
/** @jsx */
import React from 'react'
import moment from 'moment'
import lodash from 'lodash'
import { Input } from '@chakra-ui/react'

const OPERATORS = {
  Boolean: { true: v => !!v, false: v => !v, empty: lodash.isNil },
  Number: {
    '=': (v, ref) => v == ref,
    '<': (v, ref) => v < ref,
    '>': (v, ref) => v > ref,
    '<>': (v, ref) => v != ref,
    'is empty': lodash.isNil,
    'is not empty': v => !lodash.isEmpty,
  },
  String: {
    '=': (v, ref) => v == ref,
    '<': (v, ref) => v < ref,
    '>': (v, ref) => v > ref,
    '<>': (v, ref) => v != ref,
    contains: (v, ref) => v?.toLowerCase()?.includes(ref?.toLowerCase()),
    'does not contain': (v, ref) =>
      !v?.toLowerCase()?.includes(ref?.toLowerCase()),
    'is empty': lodash.isNil,
    'is not empty': v => !lodash.isEmpty(v),
  },
  Date: {
    before: (v, ref) => moment(v).isBefore(moment(ref)),
    after: (v, ref) => moment(v).isAfter(moment(ref)),
    'is empty': lodash.isNil,
    'is not empty': v => !lodash.isEmpty(v),
  },
  Enum: {
    '=': (v, ref) => v == ref,
    '<>': (v, ref) => v != ref,
    in: (v, ref) => ref?.split(',').includes(v),
    'is empty': lodash.isNil,
    'is not empty': v => !lodash.isEmpty(v),
    /**
    'does not contain': (v, ref) =>
      v?.toLowerCase()?.includes(ref?.toLowerCase()),
    'is empty': lodash.isNil,
    */
  },
  Ref: {
    'exists': v => !lodash.isNil(v),
    'not exists': v => lodash.isNil(v),
  },
  Array: {
    'is empty': v => lodash.isEmpty(v),
    'is not empty': v => !lodash.isEmpty(v),
  }
}

const getOperators = att => {
  if(att?.enumValues) {
    return OPERATORS.Enum
  }
  if(att?.multiple) {
    return OPERATORS.Array
  }
  if(att?.ref) {
    return OPERATORS.Ref
  }
  return OPERATORS[att?.type]
}

const isOperatorMultiple = (att, op) => {
  return att?.enumValues && op=='in'
}

const createFilters = (filterDef, props, componentValueGetter) => {
  return Object.entries(filterDef).map(([id, def]) => {
    const targetValue = props[`condition${id}`] || false
    const attribute = def.attribute
    const opFn = getOperators(def)[def.operator]
    const vRef = def.value
    return dataSource => {
      const dataValue = def.isComponent ?
        componentValueGetter(attribute, props.level)
        :lodash.get(dataSource, attribute)
      return opFn(dataValue, vRef) ? targetValue : null
    }
  })
}

const getConditionalProperties = (props, dataSource, componentValueGetter) => {
  const conditions = Object.keys(props).filter(k => /^conditions/.test(k))
  const properties = Object.fromEntries(
    conditions
      .map(cond => {
        const property = cond.match(/^conditions(.*)$/)[1]
        const filters = createFilters(props[cond], props, componentValueGetter)
        const v = filters.map(f => f(dataSource)).find(v => v!=null)
        return v!=null ? [property, v] : null
      })
      .filter(v => !!v),
  )
  return properties
}

const ValueComponent = ({ type, operator, ...props }) => {
  const VALUE_COMPONENTS = {
    Boolean: _ => null,
    Number: op =>
      op === 'is empty' ? null : props => <Input type="number" {...props} />,
    String: op => (op === 'is empty' ? null : props => <Input {...props} />),
    Date: op =>
      op === 'is empty' ? null : props => <Input type="date" {...props} />,
  }

  const Cmp = VALUE_COMPONENTS[type]?.(operator)
  return Cmp ? <Cmp {...props} /> : null
}

const getConditionPropertyName = conditionId => {
  return `condition${conditionId}`
}

const getConditionsPropertyName = property => {
  return `conditions${property}`
}

const buildFilter = (dataSourceId, filterAttributes, componentsValues) => {
  // componentsValues stores comp-XXX_0_1_2 while componentName is the studio's one (i.e. comp-XXX)
  const log=dataSourceId=='root' ? console.log : () => {}
  const getComponentValue= compId => {
    const val=Object.entries(componentsValues).find(([compo, value]) => compo.startsWith(compId))?.[1]
    return val
  }
  const filters=filterAttributes[dataSourceId]
  const constants=filters?.constants?.map(([att, value]) => `filter.${att}=${value}`) || []
  const chunked=lodash.chunk(filters?.variables?.[0] || [], 2)
  const variables=chunked.filter(([att, comp]) => ![null, undefined].includes(getComponentValue(comp)))
    .map(([att, comp]) => `filter.${att}=${getComponentValue(comp)}`)  || []
  const allFilters=[...constants, ...variables]
  const res=allFilters.length>0 ? allFilters.join('&')+'&' : ''
  return res
}

module.exports = {
  buildFilter,
  getConditionsPropertyName,
  getConditionPropertyName,
  ValueComponent,
  getConditionalProperties,
  isOperatorMultiple,
  getOperators,
  OPERATORS
}