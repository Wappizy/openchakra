import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch'
import Grid from '@material-ui/core/Grid'
import InputAdornment from '@material-ui/core/InputAdornment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import styles from './ButtonSwitchStyle'
import Typography from '@material-ui/core/Typography'
import '../../static/assets/css/custom.css'

const CssTextField = withStyles({
  root: {
    '& label': {
      fontSize: '0.8rem',
    },
  },
})(TextField)


class ButtonSwitch extends React.Component {
  constructor(props) {
    super(props)
    this.checked= this.props.checked
    this.billing= props.billing ? (props.billing._id || this.props.billing): props.isOption ? this.props.billings[0]._id : null
    this.price = this.props.price
    this.label = this.props.label


    this.onToggle = this.onToggle.bind(this)
    this.onChangeBilling = this.onChangeBilling.bind(this)
    this.onChangePrice = this.onChangePrice.bind(this)
    this.onChangeLabel = this.onChangeLabel.bind(this)

    this.fireChange = this.fireChange.bind(this)
  }

  fireChange() {
    if (this.props.onChange) {
      this.props.onChange(this.props.id, this.checked, this.checked ? this.price : null, this.billing, this.label)
    }
  }

  onToggle() {
    this.checked = !this.checked
    this.fireChange()
  }

  onChangeBilling(event) {
    this.billing = event.target.value
    this.fireChange()
  }

  onChangePrice(event) {
    let price = parseInt(event.target.value)
    if (isNaN(price)) {
      price = null
    }
    this.price = price
    this.fireChange()
  }

  onChangeLabel(event) {
    this.label = event.target.value
    this.fireChange()
  }

  render() {
    const {classes, isEditable, isOption, isPrice, billings, priceDisabled} = this.props
    let{checked, label} = this

    return (
      <Grid className={classes.contentFiltre}>
        <Grid className={classes.responsiveIOSswitch} style={{width: this.props.width}}>
          <Grid>
            <Switch
              focusVisibleClassName={classes.focusVisible}
              disableRipple
              classes={{
                root: classes.root,
                switchBase: `custombuttonswitch ${classes.switchBase}`,
                thumb: classes.thumb,
                track: classes.track,
                checked: classes.checked,
              }}
              color="primary"
              type="checkbox"
              checked={checked}
              onChange={this.onToggle}
            />
          </Grid>
          <Grid>
            <span>
              {isEditable ?
                <CssTextField
                  label={'Intitulé'}
                  placeholder={'Saisissez un intitulé'}
                  value={this.label}
                  onChange={this.onChangeLabel}
                  error={!this.label}
                  helperText={this.label ? null : 'Obligatoire'}
                />
                :
                <p>{label === undefined ? 'label introuvable' : label}</p>
              }
            </span>
          </Grid>
        </Grid>
        {isPrice ?
          <Grid className={classes.responsiveIOSswitchContent}>
            {checked === true ?
              <Grid style={{display: 'flex'}}>
                <CssTextField
                  value={this.price}
                  label={<Typography style={{color: '#696767'}}>Tarif</Typography>}
                  type="number"
                  className={classes.textField}
                  disabled={!checked || priceDisabled}
                  onChange={this.onChangePrice}
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                    endAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                  error={!this.price}
                  helperText={this.price ? null : 'Obligatoire'}
                />
                {isOption ?
                  <Select
                    style={{
                      width: '100px',
                      fontSize: '0.8rem',
                    }}
                    disabled={!checked}
                    margin="none"
                    onChange={this.onChangeBilling}
                    value={this.billing}
                  >
                    {billings.map(bill => {
                      return (
                        <MenuItem value={bill._id.toString()}>{bill.label}</MenuItem>
                      )
                    },
                    )
                    }
                  </Select> : null
                }
              </Grid>
              : null
            }
          </Grid> : null
        }

      </Grid>
    )
  }
}

export default withStyles(styles)(ButtonSwitch)
