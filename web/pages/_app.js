import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-datepicker/dist/react-datepicker.css'
import 'react-input-range/lib/css/index.css'
import 'react-tabs/style/react-tabs.css'

import '../static/cssdashboard.css'
import '../static/form.css'
import '../static/forminputs.css'
import '../static/inputRange.css'
import '../static/style1.css'
import '../static/stylesfonts.css'

import {MuiThemeProvider} from '@material-ui/core/styles'
import App, {Container} from 'next/app'
import CookieConsent from 'react-cookie-consent'
import CssBaseline from '@material-ui/core/CssBaseline'
import Head from 'next/head'
import JssProvider from 'react-jss/lib/JssProvider'
import React from 'react'
import Router from 'next/router'

import {ACCEPT_COOKIE_NAME} from '../utils/consts'
import {COOKIE_CONSENT} from '../utils/i18n'
import {getLoggedUser} from '../utils/context'
import {snackBarError} from '../utils/notifications'
import getPageContext from '../lib/getPageContext'
import {I18nextProvider} from 'react-i18next'
import i18n from '../server/utils/i18n_init'


class MyApp extends App {
  constructor() {
    super()
    this.pageContext = getPageContext()
  }

  loadTawlkto() {
    (function() {
      let s1 = document.createElement('script'), s0 = document.getElementsByTagName('script')[0]
      s1.async = true
      s1.src='https://embed.tawk.to/5de4db8c43be710e1d201adc/default'
      s1.charset = 'UTF-8'
      s1.setAttribute('crossorigin', '*')
      s0.parentNode.insertBefore(s1, s0)
    })()
  }

  componentDidMount() {
    this.loadTawlkto()
  }

  onDeclineCookies = () => {
    if (getLoggedUser()) {
      snackBarError('Vous allez être déconnecté')
      Router.push('/logout')
    }
  }

  render() {
    const {Component, pageProps} = this.props
    return (
      <I18nextProvider i18n={i18n}>
        <Container>
          <Head>
            <title>My Alfred</title>
            <meta property="og:image" content="https://my-alfred.io/static/presentation.jpg"/>
            <meta property="og:description"
              content="Réservez et proposez tous types de services immédiatement et très simplement autour de chez vous"/>
            <meta property="description"
              content="Réservez et proposez tous types de services immédiatement et très simplement autour de chez vous"/>
            <meta property="og:type" content="website"/>
            <meta property="og:url" content="https://my-alfred.io"/>
            <meta property="og:image:secure_url" content="https://my-alfred.io/static/presentation.jpg"/>
            <meta property="og:title" content="My Alfred - services autour de chez vous"/>
            <meta property="fb:app_id" content="512626602698236"/>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"
              integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
              crossOrigin=""/>
            <link rel="shortcut icon" href="/static/favicon.ico" type="image/x-icon"/>
            <link rel="icon" href="/static/favicon.ico" type="image/x-icon"/>
            <link rel="preconnect" href="https://fonts.gstatic.com"/>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"/>
          </Head>
          {/* Wrap every page in Jss and Theme providers */}
          <CookieConsent
            buttonText={COOKIE_CONSENT.accept}
            enableDeclineButton
            declineButtonText={COOKIE_CONSENT.decline}
            location="top"
            cookieName={ACCEPT_COOKIE_NAME}
            onDecline={this.onDeclineCookies}
            containerClasses={'customCookiesContainer'}
            contentClasses={'customCookiesContent'}
            buttonClasses={'customCookiesAccept'}
            declineButtonClasses={'customCookiesDecline'}
          >
            {COOKIE_CONSENT.message}
          </CookieConsent>

          <JssProvider
            registry={this.pageContext.sheetsRegistry}
            generateClassName={this.pageContext.generateClassName}
          >
            {/* MuiThemeProvider makes the theme available down the React
                tree thanks to React context. */}
            <MuiThemeProvider
              theme={this.pageContext.theme}
            >
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <CssBaseline/>
              {/* Pass pageContext to the _document though the renderPage enhancer
                  to render collected styles on server-side. */}
              <Component pageContext={this.pageContext} {...pageProps} />
            </MuiThemeProvider>
          </JssProvider>

        </Container>
      </I18nextProvider>
    )
  }
}

export default MyApp
