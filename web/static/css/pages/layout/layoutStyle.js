const style=theme => ({
  layoutScrollMenu: {
    display: 'flex',
    justifyContent: 'center',
    height: '10%',
    alignItems: 'flex-end',

  },
  filterMenuDivierContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  filterMenuDividerStyle: {
    height: 1,
    width: '100%',
  },
  mainContainerStyleFooter: {
    justifyContent: 'center',
    flexDirection: 'column',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
  },
  generalWidthFooter: {
    backgroundColor: 'rgba(228, 228, 228, 8)',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',

  },
  hiddenOnMobile: {
    width: '100%',
    [theme.breakpoints.only('xs')]: {
      display: 'none',
    },
    [theme.breakpoints.only('sm')]: {
      display: 'none',
    },
    [theme.breakpoints.only('md')]: {
      display: 'none',
    },
  },
})
export default style
