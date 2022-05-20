const style=theme => ({
  textField:{
    width: '100%',
  },
  datePicker:{
    padding: '18.5px 14px',
    width: '100%',
    height: 'auto',
    overflow: 'hidden',
    minHeight: '1.1876em',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: 4,

  },
  textFieldDatePicker:{
    width: '100%',
    '& .react-datepicker-wrapper':{
      width: '100%'
    }
  },
  button:{
    fontWeight: 'bold',
    color:'white',
    textTransform: 'initial'
  },
  buttonCheckPhone:{
    fontWeight: 'bold',
    textTransform: 'initial',
    width: '100%',
    color:'white',
  },
  layoutAccountContainer:{
    [theme.breakpoints.only('xs')]:{
      display: 'none'
    }
  },
  layoutMobileContainer:{
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
    }
  }
})
export default style
