import axios from 'axios'
import React from 'react'
import Footer from '../hoc/Layout/Footer/Footer'
import {Helmet} from 'react-helmet'
import Grid from '@material-ui/core/Grid'
import InfoBar from '../components/InfoBar/InfoBar'
import {withStyles} from '@material-ui/core/styles'
import styles from '../static/css/pages/homePage/index'
import NavBar from '../hoc/Layout/NavBar/NavBar'
import BannerPresentation from '../components/HomePage/BannerPresentation/BannerPresentation'
import CategoryTopic from '../components/HomePage/Category/CategoryTopic'
import OurAlfred from '../components/HomePage/OurAlfred/OurAlfred'
import HowItWorks from '../components/HomePage/HowItWorks/HowItWorks'
import NewsLetter from '../components/HomePage/NewsLetter/NewsLetter'
import MobileNavbar from '../hoc/Layout/NavBar/MobileNavbar'
import TrustAndSecurity from '../hoc/Layout/TrustAndSecurity/TrustAndSecurity'
import {Dialog, DialogActions, DialogContent, Divider} from '@material-ui/core'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import ResaService from '../components/HomePage/ResaService/ResaService'
import {isB2BStyle, isApplication, isMobile} from '../utils/context'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import {isAndroid} from 'react-device-detect'
const {PRO, PART} = require('../utils/consts')
const {getLoggedUserId} = require('../utils/context')
import Router from 'next/router'
import '../static/assets/css/custom.css'


const DialogTitle = withStyles(styles)(props => {
  const {children, classes, onClose, ...other} = props
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon/>
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  )
})

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.child = React.createRef()
    this.state = {
      category: {},
      alfred: {},
      logged: false,
      user: {},
      open: false,
    }
  }


  componentDidMount() {
    if (getLoggedUserId()) {
      this.setState({logged: true})
    }
    if (isMobile()) {
      this.setState({open: true})
    }


    axios.get('/myAlfred/api/users/current')
      .then(res => {
        let data = res.data
        this.setState({
          user: data,
          gps: data.billing_address ? data.billing_address.gps : null,
        },
        )
      })
      .catch(err => {
        console.error((err))
      })

    axios.get(`/myAlfred/api/category/${isB2BStyle(this.state.user) ? PRO : PART}`)
      .then(res => {
        let category = res.data
        this.setState({category: category})
      }).catch(err => console.error(err))

    axios.get(`/myAlfred/api/serviceUser/home/${isB2BStyle(this.state.user) ? PRO : PART}`)
      .then(response => {
        let alfred = response.data
        this.setState({alfred: alfred})
      }).catch(err => console.error(err))
  }

  dialogStore = classes => {
    const {open} = this.state


    return (
      <Dialog onClose={() => this.setState({open: false})} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={() => this.setState({open: false})}>
          <Grid style={{display: 'flex'}}>
            <img style={{marginRight: '7vh'}} src="../static/assets/icon/iconBlueDeep20@3x-2.png" alt="icone application myAlfred"/>
            <Grid>
              Application My&nbsp;Alfred
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Notre application est disponible sur {isAndroid ? 'Google play' : 'Apple store'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => Router.push(isAndroid ? 'https://play.google.com/store/apps/details?id=com.myalfred' : 'https://apps.apple.com/us/app/my-alfred/id1544073864')}
            color="primary">
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  resizeFrame = () => {

    let iframe = document.querySelector('#myIframe')

    window.addEventListener('message', e => {
      // message that was passed from iframe page
      let message = e.data
      iframe.style.height = `${message.height }px`
    }, false)
  }

  callLogin = () => {
    this.child.current.handleOpenLogin()
  }

  render() {
    const {classes} = this.props
    const {category, alfred, open, user} = this.state
    return (

      <Grid>
        <Helmet>
          <title>Services rémunérés entre particuliers - My Alfred </title>
          <meta
            property="description"
            content="Des milliers de services référencés ! Consultez les offres de service rémunérés de milliers de particuliers avec My Alfred, première application d’offres de services entre particuliers. Rendre service en étant rémunéré autour de chez soi n’a jamais été aussi simple"
          />
        </Helmet>
        <Grid>
          <Grid className={`customHeaderInfobar ${classes.infoBarContainer}`}>
            <InfoBar/>
          </Grid>
          <Grid container className={classes.navbarAndBannerContainer}>
            <Grid
              item
              xl={12}
              lg={12}
              sm={12}
              md={12}
              xs={12}
              className={`custombanner ${isB2BStyle(user) ? classes.navbarAndBannerBackgroundb2b : classes.navbarAndBannerBackground}` }
            >
              <Grid className={`${classes.navbarComponentPosition} customHeader`}>
                <NavBar ref={this.child}/>
              </Grid>
              <Grid className={classes.bannerPresentationContainer}>
                <Grid className={classes.bannerSize}>
                  <BannerPresentation/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {
            isB2BStyle(user) ? <iframe
              onLoad={this.resizeFrame}
              frameBorder="0"
              scrolling="no"
              id="myIframe"
              src="/blog/accueil"
              style={{width: '100%'}}
            >
            </iframe> : null
          }
          <Grid container className={`customslidecat ${classes.mainContainerStyle}`}>
            <Grid className={classes.generalWidthContainer}>
              <CategoryTopic category={category}/>
            </Grid>
          </Grid>
          <Grid container className={isB2BStyle(user) ? classes.howItWorksComponentB2b : classes.howItWorksComponent}>
            <Grid className={classes.generalWidthContainer}>
              <HowItWorks/>
            </Grid>
          </Grid>
          <Grid container className={classes.mainContainerStyle}>
            <Grid className={classes.generalWidthContainer}>
              <OurAlfred alfred={alfred}/>
            </Grid>
          </Grid>
          {
            isB2BStyle(user) ? null : <Grid container className={classes.becomeAlfredComponent}>
              <Grid className={classes.generalWidthContainer}>
                <ResaService triggerLogin={this.callLogin}/>
              </Grid>
            </Grid>
          }
          <Grid className={classes.newsLetterContainer}>
            {
              isB2BStyle(user) ? null : <Grid container className={classes.mainNewsLetterStyle}>
                <Grid className={classes.generalWidthContainerNewsLtter}>
                  <NewsLetter/>
                </Grid>
              </Grid>
            }
          </Grid>
          <Grid>
            <Divider/>
          </Grid>
          <Grid className={classes.hideAndShowTrustAndSecurity}>
            <Grid className={classes.trustAndSecurityContainer}>
              <Grid className={classes.trustAndSecurityComponent}>
                <TrustAndSecurity/>
              </Grid>
            </Grid>
          </Grid>
          <Grid container className={classes.mainContainerStyleFooter}>
            <Grid className={classes.generalWidthFooter}>
              <Footer/>
            </Grid>
          </Grid>
          <Grid className={classes.mobileNavBarContainer}>
            <Grid style={{width: '100%'}}>
              <MobileNavbar currentIndex={0}/>
            </Grid>
          </Grid>
        </Grid>
        {!isApplication() ? open ? this.dialogStore(classes) : null : null}
      </Grid>
    )
  }
}

export default withStyles(styles)(Home)
