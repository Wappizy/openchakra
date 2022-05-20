const style=theme => ({
  howItWorksMainStyle: {
    padding: theme.padding.homePage.section.padding,
  },
  howItWorksMainContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  howItWorksLeftContainer: {
    width: '30%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  howItWorksLeftText: {
    color: theme.palette.white.main,
    fontSize: theme.typography.subTitle.fontSize,
    fontWeight: theme.typography.subTitle.fontWeight,
    fontFamily: theme.typography.subTitle.fontFamily,
  },
  howItWorksRightContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '30%',
    [theme.breakpoints.only('sm')]: {
      display: 'none',
    },
    [theme.breakpoints.only('xs')]: {
      display: 'none',
    },
  },
  howItWorksRightText: {
    color: theme.palette.white.main,
    fontSize: theme.typography.text.fontSize,
    fontWeight: theme.typography.text.fontWeight,
    fontFamily: theme.typography.text.fontFamily,
  },
})
export default style
