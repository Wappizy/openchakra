const Style = theme => ({
  servicesConntainer:{
    [theme.breakpoints.down('xs')]:{
      display: 'flex',
      flexDirection: 'column-reverse'
    },
    [theme.breakpoints.down('xs')]:{
      marginBottom: '12vh'
    }
  },
  containerAskQuestion:{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.only('xs')]:{
      display: 'none'
    },
    [theme.breakpoints.only('sm')]:{
      display: 'none'
    },
  },
  profileLayoutContainer:{
    [theme.breakpoints.only('xs')]:{
      display: 'none'
    },
  },
  containerLayoutMobileProfile:{
    [theme.breakpoints.only('xl')]:{
      display: 'none'
    },
    [theme.breakpoints.only('lg')]:{
      display: 'none'
    },
    [theme.breakpoints.only('md')]:{
      display: 'none'
    },
    [theme.breakpoints.only('sm')]:{
      display: 'none'
    },
  }
})
module.exports=Style
