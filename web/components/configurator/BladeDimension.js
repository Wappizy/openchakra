const {withTranslation} = require('react-i18next')
const {
  BLADE_SHAPES,
  CHARGEUSE,
  DELTA,
  DROITE,
  SEMI_DELTA,
} = require('../../utils/feurst_consts')
const {
  FormControl,
  MenuItem,
  Radio,
  InputAdornment,
  Select,
  Input,
} = require('@material-ui/core')

import React from 'react'
import {feurstImgPath} from '../../pages/configurator'
const lodash=require('lodash')

function BladeDimension(props) {

  const blades = {
    [DROITE]: {
      label: props.t(BLADE_SHAPES[DROITE]),
      path: `${feurstImgPath}/lame-droite.svg`,
      width: '120',
      height: '74',
    },
    [SEMI_DELTA]: {
      label: props.t(BLADE_SHAPES[SEMI_DELTA]),
      path: `${feurstImgPath}/lame-semidelta.svg`,
      width: '120',
      height: '74',
    },
    [DELTA]: {
      label: props.t(BLADE_SHAPES[DELTA]),
      path: `${feurstImgPath}/lame-delta.svg`,
      width: '120',
      height: '74',
    },
  }

  const availableBlades=lodash.pick(blades, [DROITE, props.type==CHARGEUSE ? DELTA : SEMI_DELTA])

  return (
    <div className='flex flex-col gap-x-4 md-flex-row justify-evenly gap-x-8'>
      <div>
        <h2>{props.t('BLADE_DIMENSIONS.blade_shape_label')}</h2>

        {Object.keys(availableBlades).map(shape => (
          <div key={shape} className='flex justify-center mr-8 mb-6'>
            <Radio
              checked={props.bladeShape === shape}
              onChange={ev => props.onBladeShapeChange(ev.target.value)}
              value={shape}
              name="bladeShape"
              id={shape}
              inputProps={{'aria-label': blades[shape].label}}
            />
            <label className='flex flex-col items-center' htmlFor={shape}>
              {blades[shape].label}<img src={blades[shape].path} alt="" width={blades[shape].width} height={blades[shape].height} />
            </label>
          </div>
        ))}

      </div>

      <div>
        <h2 id='bucketthickness'>{props.t('BLADE_DIMENSION.blade_thickness_label')}</h2>

        <Select labelId='bucketthickness' className='w-full mb-6' name='bladeThickness' value={props.bladeThickness || ''} onChange={ev => props.onBladeThicknessChange(ev.target.value)} aria-describedby="bucketthickness">
          {props.thicknesses.map((thick, index) => (
            <MenuItem key={`${thick}-${index}`} value={thick}>{`${thick} mm`}</MenuItem>
          ))}
        </Select>

        <h2 id="bucketWidth">{props.t('BLADE_DIMENSION.bucket_width_label')}</h2>

        <FormControl className='w-full mb-6' variant="standard">
          <Input
            id="bucketWidth"
            name="bucketWidth"
            type='number'
            min={0}
            value={props.bucketWidth || ''}
            onChange={ev => props.onBucketWidthChange(ev.target.value)}
            endAdornment={<InputAdornment position="end">mm</InputAdornment>}
            aria-describedby="bucket_width"
            inputProps={{
              'aria-label': 'largeur godet en mm',
            }}
          />
        </FormControl>
      </div>

      <div className='flex items-center justify-center' style={{textAlign: 'center'}}>
        <img src='' alt='belle image' width={300} height={300} className='flex items-center justify-center' style={{border: '1px solid blue'}} />
      </div>
    </div>
  )
}

const validator = state => {
  return !!state.bladeShape && !!state.bladeThickness
}

const TransBladeDimension=withTranslation('feurst', {withRef: true})(BladeDimension)
module.exports={BladeDimension: TransBladeDimension, bladeDimensionValidator: validator}
