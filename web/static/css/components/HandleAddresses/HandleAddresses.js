const style=theme => ({
  buttonSave: {
    textTransform: 'initial',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'black',
  },
  editContainer: {
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
      justifyContent: 'flex-end',
    },
  },
  textField: {
    width: '100%',
  },
  cancelButton: {
    color: theme.palette.error.main,
  },
})
export default style
