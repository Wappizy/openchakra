const style=theme => ({
  drawerAndSchedule_mainContainer:{
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  drawerAndSchedule_scheduleContainer:{
    width: '100%',
    [theme.breakpoints.down('xs')]:{
      marginBottom: 100
    }
  },

  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: '35%',
      flexShrink: 0,
    },
  },


})
export default style
