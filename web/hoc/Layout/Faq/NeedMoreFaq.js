import {withTranslation} from 'react-i18next'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import Link from '../../../components/Link/Link'
import {withStyles} from '@material-ui/core/styles'
import '../../../static/assets/css/custom.css'

const styles = () => ({
  link: {
    fontWeight: 'bold',
    borderBottom: '1px solid black',
    '&:hover': {
      color: '#84A5E0',
      borderBottom: '1px solid #84A5E0',
    },
  },
})

class NeedMoreFaq extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {classes} = this.props
    return (
      <Grid style={{
        display: ' flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <Grid style={{margin: '0 auto'}}>
          <h3 style={{fontWeight: 'bold'}} className={'customaddservicewantmore'}>Et si vous souhaitez en savoir plus</h3>
          <p>Vous pouvez <Link href={'/contact'}>
            <span className={classes.link}>nous contacter</span>
          </Link>
          </p>
        </Grid>
      </Grid>
    )
  }
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(NeedMoreFaq))
