export default theme => ({
  generalWidthContainer: {
    width: '60%',
    [theme.breakpoints.down('xs')]: {
      width: '80%'
    }
  },
  generalWidthContainerNewsLtter: {
    width: '60%',
    [theme.breakpoints.down('lg')]: {
      width: '80%'
    }
  },
  bannerSize: {
    width: '60%',
    [theme.breakpoints.down('xs')]: {
      width: '80%'
    }
  },
  navbarInput: {
    borderBottom: 'inherit',
    '&::placeholder': {
      opacity: '0.55',
      color: theme.palette.placeHolder.main,
    }
  },


  bannerPresentationContainerIllustration: {
    display: 'flex',
    alignItems: 'center',
    width: '60%'
  },
  navbarAndBannerContainer: {
    height: '80vh',
  },
  navbarAndBannerBackground: {
    backgroundColor:  theme.palette.primary.main,
  },
  navbarAndBannerBackgroundb2b: {
    backgroundColor: theme.palette.b2b.main,
  },
  navbarComponentPosition: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    marginTop: '2%'
  },

  bannerPresentationContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '7vh',
  },
  mainContainerStyle: {
    justifyContent: 'center',
    marginTop: '10vh',
    marginBottom: '10vh'
  },
  mainNewsLetterStyle: {
    justifyContent: 'center',
  },

  becomeAlfredMainContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: theme.padding.homePage.section.padding
  },
  becomeAlfredContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  becomeAlfredButton: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.blackButton.fontWeight,
    fontFamily: theme.typography.blackButton.fontFamily,
    backgroundColor: theme.palette.white.main,
    borderRadius: theme.border.blackButton.borderRadius,
    padding: theme.padding.blackButton.padding,
  },
  resaServiceButton: {
    color: '#F8CF61',
    fontWeight: theme.typography.blackButton.fontWeight,
    fontFamily: theme.typography.blackButton.fontFamily,
    backgroundColor: theme.palette.white.main,
    borderRadius: theme.border.blackButton.borderRadius,
    padding: theme.padding.blackButton.padding,
  },
  becomeAlfredTitle: {
    color: theme.palette.white.main,
    fontFamily: theme.typography.subTitle.fontFamily,
    fontWeight: theme.typography.subTitle.fontWeight,
    margin: theme.typography.subTitle.margin,
  },
  becomeAlfredText: {
    fontFamily: theme.typography.text.fontFamily,
    color: theme.palette.white.main,
    fontWeight: theme.typography.text.fontWeight,
    fontSize: theme.typography.text.fontSize
  },
  becomeAlfredComponent: {
    justifyContent: 'center',
    marginTop: '2%',
    backgroundColor: theme.palette.primary.main,
  },
  howItWorksComponent: {
    justifyContent: 'center',
    marginTop: '2%',
    backgroundColor: theme.palette.yellow.main
  },
  howItWorksComponentB2b: {
    justifyContent: 'center',
    marginTop: '2%',
    backgroundColor: '#3C4047'
  },
  generalWidthFooter: {
    width: '90%'
  },
  trustAndSecurityContainer: {
    [theme.breakpoints.down('xs')]: {
      marginTop: '5vh',
      marginBottom: '5vh',
      display: 'flex',
      justifyContent: 'center'
    }
  },
  trustAndSecurityComponent: {
    padding: '2vh',
    [theme.breakpoints.down('sm')]: {
      marginTop: '5vh',
      marginBottom: '5vh',
      width: '100%',
    },
    [theme.breakpoints.down('xs')]: {
      margin: 0,
      width: '90%',
    }
  },
  mainContainerStyleFooter: {
    justifyContent: 'center',
    backgroundColor: 'rgba(228, 228, 228, 8)'
  },
  categoryCardRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  cardPreviewMainStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  menuHeaderActive: {
    '&:active': {
      color: '#84A5E0',
      borderBottom: '#84A5E0'
    }
  }
})
