export default theme => ({
  statContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  statContainerLabel: {
    marginRight: '3vh',
    color: 'rgba(39,37,37,35%)',
  },
  statPadding: {
    paddingRight: '34px !important',
  },
  statResultContainer: {
    marginTop: '10vh',
    marginBottom: '12vh',
    backgroundColor: 'rgba(229,229,229,1)',
    borderRadius: 44,
    padding: '5%',
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  statResultData: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row',
      marginTop: '3vh',
      marginBottom: '3vh',
    },
  },
  statData: {
    marginTop: '3vh',
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      justifyContent: 'flex-end',
    },
  },
  statResultLabel: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'left',
    },
  },
  containerAskQuestion: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.only('xs')]: {
      display: 'none',
    },
    [theme.breakpoints.only('sm')]: {
      display: 'none',
    },
  },
  profileLayoutContainer: {
    [theme.breakpoints.only('xs')]: {
      display: 'none',
    },
  },
  layoutMobileProfileContainer: {
    [theme.breakpoints.only('xl')]: {
      display: 'none',
    },
    [theme.breakpoints.only('lg')]: {
      display: 'none',
    },
    [theme.breakpoints.only('md')]: {
      display: 'none',
    },
    [theme.breakpoints.only('sm')]: {
      display: 'none',
    },
  },
})
