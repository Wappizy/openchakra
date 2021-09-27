import ReactHtmlParser from 'react-html-parser'
import {withTranslation} from 'react-i18next'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/core/styles/withStyles'
import styles from '../../static/css/components/Layout/LayoutMobileMessages/LayoutMobileMessages'
import IconButton from '@material-ui/core/IconButton'
import Router from 'next/router'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import Divider from '@material-ui/core/Divider'
import MobileNavbar from './NavBar/MobileNavbar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import {LAYOUT_MESSAGES} from '../../utils/i18n'

class LayoutMobileMessages extends React.Component {

  constructor(props) {
    super(props)
    this.state={
      currentUrlIndex: '',
    }
  }

  handleChange = (event, newValue) => {
    this.setState({tabIndex: newValue}, () => this.props.handleChange(event, newValue))
  }

  render() {
    const {classes, children, tabIndex, currentIndex, user}= this.props

    return(
      <Grid>
        <Grid className={classes.layoutMobileMessageHeader}>
          <Grid>
            <Grid style={{padding: '5%'}}>
              <IconButton aria-label="ArrowBackIosIcon" onClick={() => Router.back()}>
                <ArrowBackIosIcon/>
              </IconButton>
            </Grid>
          </Grid>
          <Grid style={{marginLeft: '8vh'}}>
            <h2>{ReactHtmlParser(this.props.t('LAYOUT_MESSAGES.title'))}</h2>
          </Grid>
          <Grid>
            <Tabs
              value={user && !user.is_alfred ? 0 : tabIndex}
              onChange={user && !user.is_alfred ? null : this.handleChange}
              aria-label="scrollable force tabs"
              classes={{indicator: classes.scrollIndicator}}
            >
              {
                user && user.is_alfred ?
                  <Tab label={ReactHtmlParser(this.props.t('LAYOUT_MESSAGES.messages_alfred'))} className={classes.scrollMenuTab} />
                  :null

              }
              <Tab label={ReactHtmlParser(this.props.t('LAYOUT_MESSAGES.messages_user'))} className={classes.scrollMenuTab} />
            </Tabs>
          </Grid>
        </Grid>
        <Grid>
          <Divider/>
        </Grid>
        <Grid style={{padding: '10%'}}>
          {children}
        </Grid>
        <Grid style={{position: 'fixed', bottom: '3%', display: 'flex', justifyContent: 'center', width: '100%', zIndex: 1}}>
          <Grid style={{width: '100%'}}>
            <MobileNavbar currentIndex={currentIndex}/>
          </Grid>
        </Grid>
      </Grid>
    )
  }

}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(LayoutMobileMessages))
