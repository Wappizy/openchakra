const Style = theme => ({
  fullContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  datenaissance: {
    marginTop: 20,
    width: '100%',
  },
  newContainer: {
    padding: '5%',
    [theme.breakpoints.down('xs')]: {
      padding: 10,
    },
  },
  country: {
    width: '100%',
  },

  birthday: {
    height: 40,
    fontSize: '0.9rem',
  },
  rootStepper: {
    width: '100%',
    flexGrow: 1,

  },
  margin: {
    margin: theme.spacing(1),
    width: '100%',
  },
  textFieldAlgo: {
    borderTop: 0,
    borderLeft: 0,
    borderRight: 0,

  },
  mainContainer: {
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      justifyContent: 'center',

    },
  },
  signupContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      marginBottom: 200,
    },

  },
  card: {
    fontFamily: 'Helvetica',
    width: 800,
    marginTop: '100px',
    [theme.breakpoints.down('xs')]: {
      width: '90%',
    },
  },
  banner: {
    marginBottom: 25,
    backgroundColor: '#2FBCD3',
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },

  },
  title: {
    fontFamily: 'Helvetica',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 0,
    paddingTop: 22,
    letterSpacing: 1,
  },
  widthTextField: {
    width: '70%',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('xs')]: {
      width: '80%',
    },
  },
  bottomContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  progress: {
    [theme.breakpoints.down('xs')]: {
      width: '25%',
    },
  },
  titleRegister: {
    textAlign: 'center',
    margin: '0px auto 1.6rem',
    fontSize: '1.6rem',
    color: 'rgba(84,89,95,0.95)',
    letterSpacing: -1,
    fontWeight: 'bold',
  },
  containerSwitch: {
    width: '100%',
    height: '100%',
    margin: '0px auto 1.6rem',
  },
  genericContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  genericContainerAndMargin: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 30,
  },
  colorIcon: {
    color: 'rgba(84,89,95,0.95)',
  },
  button: {
    width: 150,
    height: 150,
    backgroundColor: 'lightgray',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  subtitle: {
    fontSize: '1.2rem',
    width: '100%',
    marginTop: 15,
    textAlign: 'center',
  },
  textStyle: {
    textAlign: 'center',
  },
  responsiveButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '5vh',
    marginBottom: '5vh',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      justifyContent: 'center',
    },
  },
  responsiveSecondaryButton: {
    [theme.breakpoints.down('xs')]: {
      marginTop: '2%',
    },
  },
  flexContainerPics: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
})
module.exports=Style
