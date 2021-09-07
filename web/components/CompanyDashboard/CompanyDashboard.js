import {withTranslation} from 'react-i18next'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import List from '@material-ui/core/List'
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import styles from '../../static/css/components/CompanyDashboard/CompanyDashboard'
import withStyles from '@material-ui/core/styles/withStyles'
import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import NavBar from '../../hoc/Layout/NavBar/NavBar'
import MobileNavbar from '../../hoc/Layout/NavBar/MobileNavbar'
import axios from 'axios'
import Router from 'next/router'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
const {setAxiosAuthentication} = require('../../utils/authentication')
const {STEPS}=require('../../utils/dashboardSteps')
const {isB2BAdmin} = require('../../utils/context')

class CompanyDashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      mobileOpen: false,
      activeStep: 0,
    }
  }

  componentDidMount() {
    setAxiosAuthentication()
    axios
      .get('/myAlfred/api/users/current')
      .then(res => {
        let user = res.data
        this.setState({
          user: user,
          email: user.email,
          firstName: user.firstname,
          name: user.name,
          position: user.position,
        })
        if(!isB2BAdmin(user)) {
          Router.push({pathname: '/'})
        }
      })
      .catch(err => {
        console.error(err)
        if (err.response.status === 401 || err.response.status === 403) {
          Router.push({pathname: '/'})
        }
      },
      )
  }

  handleDrawerToggle = () => {
    this.setState({mobileOpen: !this.state.mobileOpen})
  };

  handleStep = index => {
    this.setState({activeStep: index})
  };

  modeDashboardChange = index => {
    this.props.changeMode(index)
  }

  a11yProps = index => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    }
  }

  drawer = classes => {
    const{mode, index} = this.props
    const {activeStep} = this.state

    return (
      <Grid style={{height: '100%'}}>

        <Grid className={classes.appBarContainer}>
          <List classes={{root: classes.paddingList}}>
            {
              STEPS[ mode ].map((item, index) => (
                <Grid key={index} className={classes.hoverButton}>
                  <ListItem button key={item.menu} onClick={() => this.handleStep(index)} classes={{root: activeStep === index ? classes.activeButton : classes.standartButton}}>
                    <ListItemIcon style={{color: 'white'}}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.menu} classes={{root: classes.listItemText}}/>
                  </ListItem>
                </Grid>
              ))
            }
          </List>
          <Grid container spacing={2} style={{width: '100%', margin: 0}}>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'center'}}>
              <img
                alt={'logo_myAlfred'}
                title={'logo_myAlfred'}
                src={'/static/assets/icon/logo.svg'}
                height={64}
                style={{filter: 'invert(1)'}}/>
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.rootTabs}>
              <Tabs value={index} onChange={() => this.modeDashboardChange(index)} classes={{indicator: classes.scrollIndicator}} aria-label="simple tabs example">
                <Tab label="Conciergerie" {...this.a11yProps(0)} style={{color: 'white'}}/>
                <Tab label="Microservice" {...this.a11yProps(1)} style={{color: 'white'}} />
              </Tabs>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  };


  renderSwitch(stepIndex) {
    const {mode} = this.props

    return STEPS[ mode ][ stepIndex ].component(this)
  }

  render() {
    const{classes, window} = this.props
    const {mobileOpen, activeStep} = this.state

    const container = window !== undefined ? () => window().document.body : undefined

    return(
      <Grid className={classes.root}>
        <CssBaseline />
        <Grid>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={this.handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
        </Grid>
        <nav className={classes.drawer} aria-label="mailbox folders">
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Grid className={classes.drawerContainer}>
            <Drawer
              container={container}
              variant="temporary"
              anchor={'left'}
              open={mobileOpen}
              onClose={this.handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {this.drawer(classes)}
            </Drawer>
          </Grid>
          <Grid className={classes.drawerMobile}>
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {this.drawer(classes)}
            </Drawer>
          </Grid>
        </nav>
        <main className={classes.content}>
          <Grid className={classes.navbarContainer}>
            <NavBar/>
          </Grid>
          <Grid>
            {this.renderSwitch(activeStep)}
          </Grid>
          <Grid className={classes.mobileNavbar}>
            <Grid style={{width: '100%'}}>
              <MobileNavbar currentIndex={0}/>
            </Grid>
          </Grid>
        </main>
      </Grid>
    )
  }
}

CompanyDashboard.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
}

export default withTranslation()(withStyles(styles)(CompanyDashboard))
