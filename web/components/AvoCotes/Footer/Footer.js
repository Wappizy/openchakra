import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles'
import styles from '../../../static/css/components/FooterAvocotes/FooterAvocotes'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import {AVOCOTES} from '../../../utils/i18n'

function Footer({classes}) {
  return(
    <>
      <Grid className={classes.mainContainer}>
        <Grid style={{width: '100%', margin: 0, display: 'flex', justifyContent: 'space-between'}}>
          <Grid>
            <img
              alt={'logo_myAlfred'}
              title={'logo_myAlfred'}
              src={'../../../static/assets/icon/logo.svg'}
              height={128}
              style={{filter: 'invert(1)'}}
            />
          </Grid>
          <Grid>
            <Grid container spacing={2} style={{width: '100%', margin: 0, marginBottom: '3vh'}}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Typography>{AVOCOTES.address}</Typography>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Typography>{AVOCOTES.postal}</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={1} style={{width: '100%', margin: 0}}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Typography>{AVOCOTES.phoneContact}</Typography>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Typography>{AVOCOTES.mail}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Grid container spacing={2} style={{width: '100%', margin: 0, display: 'flex', flexDirection: 'column'}}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Typography>{AVOCOTES.askQuestion}</Typography>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Typography>{AVOCOTES.contactUs}</Typography>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Grid style={{backgroundColor: 'white', borderRadius: 30, paddingLeft: 26, paddingRight: 26, paddingTop: 12, paddingBottom: 12,width: 'max-content'}}>
                  <Typography style={{color: 'black', fontWeight: 'bold'}}>{AVOCOTES.phone}</Typography>
                </Grid>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Typography>{`${AVOCOTES.phoneTextFirst } ${ AVOCOTES.phoneTextSecond}`}</Typography>
              </Grid>
            </Grid>

          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default withStyles(styles)(Footer)
