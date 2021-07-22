export default theme => ({
  bigContainer: {
    marginTop: 0,
    flexGrow: 1,
    [theme.breakpoints.down('xs')]: {
      marginBottom: 100,
    },
  },
  hidesm: {
    minWidth: '271px',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  mobilerow: {
    marginTop: '5%',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: '15%',
      marginBottom: 30,
    },
  },
  Rightcontent: {
    marginLeft: '4%',
    marginTop: '2%',
    [theme.breakpoints.down('xs')]: {
      margin: 0,
    },
  },
  hrSeparator: {
    width: '100%',
    marginTop: 30,
    color: 'rgb(80, 80, 80, 0.2)',
  },
  buttonConfirm: {
    color: 'white',
  },
  reservationContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  buttonConfirmResa: {
    marginBottom: 10,
    [theme.breakpoints.down('xs')]: {
      marginTop: 30,
      marginBottom: 30,
    },
  },
  labelReservation: {
    marginBottom: 10,
    [theme.breakpoints.down('xs')]: {
      marginTop: 30,
    },
  },
  fontSizeTitleSectionAbout: {
    fontSize: '1rem',
    color: 'rgba(84,89,95,0.95)',
    letterSpacing: -1,
    fontWeight: 'bold',
    marginBottom: '5%',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
      display: 'flex',
      justifyContent: 'center',
    },
  },
  containerTitleSectionAbout: {
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
    },
  },
  mainContainerAboutResa: {
    borderBottom: '1.5px #8281813b solid',
    marginTop: '5%',
    paddingBottom: '7%',
    [theme.breakpoints.down('xs')]: {
      marginTop: 30,
    },
  },
  mainContainerAbout: {
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      marginTop: '3vh',
    },
  },
  bookingDetailContainer: {
    display: 'flex',
    width: '70%',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  rondYellow: {
    width: '30px',
    height: '30px',
    backgroundColor: '#A7D571',
    borderRadius: '100%',
    border:
      '0.4px solid rgba(112,112,112,0.26)',
    marginTop: '15%',
  },
  rondGrey: {
    width: '30px',
    height: '30px',
    backgroundColor: '#C4C4C4',
    borderRadius: '100%',
    border:
      '0.4px solid rgba(112,112,112,0.26)',
    marginTop: '15%',
  },
  rondOrange: {
    width: '30px',
    height: '30px',
    backgroundColor: '#D5A771',
    borderRadius: '100%',
    border:
      '0.4px solid rgba(112,112,112,0.26)',
    marginTop: '15%',
  },
  buttonReservaionRed: {
    textAlign: 'center',
    height: '40px',
    minWidth: '250px',
    backgroundColor: '#F8727F',
    lineHeight: 2.5,
    borderRadius: '50px',
    marginTop: '20%',
    cursor: 'pointer',
  },
  buttonReservationNo: {
    textAlign: 'center',
    height: '40px',
    minWidth: '250px',
    lineHeight: 2.5,
    borderRadius: '50px',
    border: '1px solid black',
    marginTop: '20%',
    cursor: 'pointer',
  },
  containerStateResa: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      marginTop: 30,
      marginBottom: 30,
    },
  },
  mainContainerStateResa: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',

  },
  marginLeftLabel: {
    marginLeft: 30,
  },
  equipmentContainer: {
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
    },
  },
  navbarShopContainer: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  detailsReservationContainer: {
    display: 'flex',
    width: '100%',
    marginTop: '3%',
  },
  containerButtonGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      justifyContent: 'center',
    },
  },
  menuButton: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  groupButtonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      marginTop: '5vh',
    },
  },
  containerPhone: {
    marginTop: '3vh',
    textAlign: 'center',
    width: '100%',
  },
  phoneContainerWeb: {
    display: 'flex',
    flexDirection: 'row',
    JustifyContent: 'space-between',
    width: '100%',
  },
})
