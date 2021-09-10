import ReactHtmlParser from 'react-html-parser'
import {withTranslation} from 'react-i18next'
import Grid from '@material-ui/core/Grid'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked'
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import Siret from '../../Siret/Siret'
import {withStyles} from '@material-ui/core/styles'
import styles from '../../../static/css/components/IntroduceYou/IntroduceYou'
import {Radio, RadioGroup} from '@material-ui/core'
import Information from '../../Information/Information'
import IconButton from '@material-ui/core/IconButton'
const {CESU} = require('../../../utils/consts')
const I18N = require('../../../utils/i18n')
import InfoIcon from '@material-ui/icons/Info'
import {SHOP} from '../../../utils/i18n'

// TODO : fix l'update ne se fait pas après appel à l'api Sirene
class IntroduceYou extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      is_particular: this.props.is_particular,
      company: this.props.company,
      cesu: this.props.cesu || null,
      cis: this.props.cis || false,
      notice: false,
      is_certified: this.props.is_certified || false,
    }
    this.fireChange = this.fireChange.bind(this)
  }

  fireChange = () => {
    const st=this.state
    this.props.onChange(st)
  };

  onChange = event => {
    const {name, value} = event.target
    this.setState({[name]: value},
      () => this.fireChange())
  };

  onCISChange = (id, checked) => {
    this.setState({cis: checked},
      () => this.fireChange())
  };

  onStatusChanged = (event, checked) => {
    if (!checked) {
      return false
    }
    let id = event.target.id
    let is_particular = (id === 'particular' && checked) || (id === 'professional' && !checked)
    if (this.state.is_particular == is_particular) {
      return
    }
    this.setState({is_particular: is_particular}, this.fireChange)

  };

  onCertifiedChanged = event => {
    this.setState({is_certified: event.target.checked},
      () => this.fireChange())
  };

  onCompanyChanged = company => {
    this.setState({company: company},
      () => this.fireChange())
  };

  render() {
    const {classes} = this.props

    return (
      <Grid container spacing={3} style={{margin: 0, width: '100%'}}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.titleContainer}>
          <h2 className={classes.policySizeTitle}>{ReactHtmlParser(this.props.t('SHOP.creation.title'))}</h2>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex'}}>
          <Grid>
            <h3 style={{color: '#403f3f'}}>{ReactHtmlParser(this.props.t('SHOP.creation.subtitle'))}</h3>
          </Grid>
          <Grid>
            <IconButton aria-label="info" className={classes.margin} onClick={() => this.setState({notice: true})}>
              <InfoIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} style={{margin: 0, width: '100%'}}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  id='particular'
                  checked={this.state.is_particular}
                  name={'isParticular'}
                  color="primary"
                  value={this.state.is_particular}
                  onChange={this.onStatusChanged}
                  icon={<CircleUnchecked/>}
                  checkedIcon={<RadioButtonCheckedIcon/>}
                />
              }
              label={<h4 className={classes.policySizeSubtitle} style={{margin: 0}}>{ReactHtmlParser(this.props.t('SHOP.creation.is_particular'))}</h4>}
            />
          </Grid>
          <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} spacing={3} style={{margin: 0, width: '100%'}}>
            {
              this.state.is_particular ?
                <Grid container spacing={1} item xl={12} lg={12} md={12} sm={12} xs={12} style={{margin: 0, width: '100%'}}>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Typography className={classes.policySizeContent}>{ReactHtmlParser(this.props.t('SHOP.creation.is_particular_description'))}</Typography>
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <RadioGroup name={'cesu'} value={this.state.cesu} onChange={this.onChange}>
                      <Grid container spacing={1} style={{width: '100%', margin: 0}}>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', alignItems: 'center'}}>
                          <Radio color="primary" value={CESU[0]}/>
                          <Typography className={classes.policySizeContent}>{ReactHtmlParser(this.props.t('SHOP.creation.is_particular_want_cesu'))}</Typography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={1} style={{width: '100%', margin: 0}}>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', alignItems: 'center'}}>
                          <Radio color="primary" value={CESU[1]}/>
                          <Typography className={classes.policySizeContent}>{ReactHtmlParser(this.props.t('SHOP.creation.is_particular_accept_cesu'))}</Typography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={1} style={{width: '100%', margin: 0}}>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', alignItems: 'center'}}>
                          <Radio color="primary" value={CESU[2]}/>
                          <Typography className={classes.policySizeContent}>{ReactHtmlParser(this.props.t('SHOP.creation.is_particular_decline_cesu'))}</Typography>
                        </Grid>
                      </Grid>
                      <Information
                        open={this.state.notice}
                        onClose={() => this.setState({notice: false})}
                        text={I18N.CESU_NOTICE}
                      />
                    </RadioGroup>
                  </Grid>
                </Grid> : null
            }
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  id='professional'
                  checked={!this.state.is_particular}
                  name={'isProfessional'}
                  color="primary"
                  value={this.state.is_particular}
                  onChange={this.onStatusChanged}
                  icon={<CircleUnchecked/>}
                  checkedIcon={<RadioButtonCheckedIcon/>}
                />
              }
              label={
                <h4 className={classes.policySizeSubtitle} style={{margin: 0}}>{ReactHtmlParser(this.props.t('SHOP.creation.is_professional'))}</h4>
              }
            />
          </Grid>
          <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} spacing={3} style={{margin: 0, width: '100%'}}>
            {this.state.is_particular ? null
              :
              <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} spacing={3} style={{margin: 0, width: '100%'}}>
                <Grid item xl={12} lg={12} sm={12} md={12} xs={12}>
                  <Typography className={classes.policySizeContent}>{ReactHtmlParser(this.props.t('SHOP.creation.is_professional_description'))}</Typography>
                </Grid>
                <Grid item xl={12} lg={12} sm={12} md={12} xs={12}>
                  <Siret onChange={this.onCompanyChanged} company={this.state.company}/>
                </Grid>
                <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} spacing={1} style={{margin: 0, width: '100%'}}>
                  <Grid item xl={12} lg={12} sm={12} md={12} xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.cis}
                          onChange={this.onCISChange}
                          color="primary"
                          name="is_certified"
                          value={this.state.is_certified}
                        />
                      }
                      label={
                        <Typography className={classes.policySizeContent}>{ReactHtmlParser(this.props.t('SHOP.creation.is_professional_cis'))}</Typography>
                      }
                    />
                  </Grid>
                  <Grid item xl={12} lg={12} sm={12} md={12} xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.is_certified}
                          onChange={this.onCertifiedChanged}
                          color="primary"
                          name="is_certified"
                          value={this.state.is_certified}
                        />
                      }
                      label={
                        <Typography className={classes.policySizeContent}>{ReactHtmlParser(this.props.t('SHOP.creation.is_professional_certif'))}</Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          </Grid>
        </Grid>
        <Information
          open={this.state.notice}
          onClose={() => this.setState({notice: false})}
          text={I18N.CESU_NOTICE}
        />
      </Grid>
    )
  }
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(IntroduceYou))
