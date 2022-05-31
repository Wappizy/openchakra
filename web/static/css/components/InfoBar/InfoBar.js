const Style = theme => ({
  infoBarMainStyle: {
    backgroundColor: theme.palette.backgroundGrey.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBarLinkContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      textAlign: 'center',
    },
  },
  infoBarColorText: {
    color: theme.palette.lightBlack.main,
    fontSize: theme.typography.infoBar.fontSize,
    lineHeight: theme.typography.infoBar.lineHeight,
    fontFamily: theme.typography.infoBar.fontFamily,
    margin: 0,
    transition: 'opacity 2s linear',
    opacity: 1,
  },
  infoBarPicsContainer: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
  showmoreContainer: {
    marginLeft: 5,
  },
  shomoreLink: {
    color: theme.palette.link.main,
    fontSize: theme.typography.infoBar.fontSize,
    lineHeight: theme.typography.infoBar.lineHeight,
    fontFamily: theme.typography.infoBar.fontFamily,
    fontWeight: theme.typography.infoBar.fontWeight,
  },
  icon: {
    width: '100%',
    height: '100%',
    backgroundSize: 'contain',
    backgroundImage: 'url(static/assets/img/warning.svg)',
  },
})
module.exports=Style
