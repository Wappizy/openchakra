import {withTranslation} from 'react-i18next'
const {setAxiosAuthentication} = require('../../../utils/authentication')
import React from 'react'
import Grid from '@material-ui/core/Grid'
import styles from '../../../static/css/components/Card/CategoryCard/CategoryCard'
import withStyles from '@material-ui/core/styles/withStyles'
import Link from 'next/link'
import axios from 'axios'
const {isB2BStyle}=require('../../../utils/context')
import '../../../static/assets/css/custom.css'
import Typography from '@material-ui/core/Typography'

class CategoryCard extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      user: {},
      gps: null,
    }
  }

  componentDidMount() {
    setAxiosAuthentication()

    axios.get('/myAlfred/api/users/current')
      .then(res => {
        let data = res.data
        this.setState({
          user: data,
          gps: data.billing_address ? data.billing_address.gps : null,
        })
      })
      .catch(err => {
        console.error((err))
      })
  }

  render() {
    const {classes, item} = this.props
    const {gps, user} = this.state

    if (!item) {
      return null
    }
    return (
      <Link
        href={`/search?category=${ item._id }${gps ? `&gps=${ JSON.stringify(gps)}` : ''}`}>
        <Grid style={{display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer'}}>
          <Grid className={classes.categoryCardMedia}>
            <Grid
              style={{backgroundImage: `url('${isB2BStyle(user) ? item.professional_picture : item.particular_picture}')`}}
              className={classes.categoryCardBackground}
            />
          </Grid>
          <Grid className={'customcardcat'}>
            <Typography className={`customtypocardcat ${classes.typocardcat}`}>{isB2BStyle(user) ? item.professional_label : item.particular_label}</Typography>
          </Grid>
        </Grid>
      </Link>

    )
  }

}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(CategoryCard))
