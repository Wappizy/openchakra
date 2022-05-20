const style=theme => ({
  schedule_customToolbarStyle: {
    display: 'flex',
    width: '100%',
    marginBottom: 5,
  },
  schedule_monthDateHeaderLabelOldDay: {
    color: '#999999',
  },
  schedule_containerLabelSelector: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  schedule_labelSelectorActive: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4fbdd7',
    borderRadius: 50,
    width: 35,
    height: 35,
    color: 'white',
  },
  schedule_labelSelector: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    '&:hover': {
      backgroundColor: 'rgba(79, 189, 215,0.5)',
      borderRadius: 50,
      width: 35,
      height: 35,
      color: 'white',
    },
  },
  schedule_monthDateHeaderLabel: {
    cursor: 'pointer',
    fontWeight: 'initial',
  },
  schedule_off_range_style: {
    width: '100%',
    height: '100%',
    borderLeft: '1px solid #DDD',
    backgroundColor: 'white',
  },
  schedule_today_style_avail: {
    width: '100%',
    height: '100%',
    borderLeft: '1px solid #DDD',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  schedule_today_style: {
    borderRadius: 50,
    width: 25,
    height: 25,
    border: '1px solid',
    borderColor: 'black',
  },
  style_today_style_off: {
    width: '100%',
    height: '100%',
    borderLeft: '1px solid #DDD',
    backgroundColor: 'lightgray',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  schedule_day_style: {
    width: '100%',
    height: '100%',
    borderLeft: '1px solid #DDD',
    cursor: 'pointer',
  },
  schedule_non_available_style: {
    width: '100%',
    height: 'auto',
    borderLeft: '1px solid #DDD',
    cursor: 'pointer',
    backgroundColor: 'lightgrey',
    background: 'repeating-linear-gradient(45deg, lightgrey 48%, #FFFFFF  50%,lightgrey 51%)',
  },
  schedule_myEventWrapperStyle: {
    borderTop: '25px solid pink',
    borderRight: '25px solid transparent',
    height: 0,
    width: 0,
    borderRadius: 0,
    padding: 0,
    margin: 0,
    marginLeft: 1,
  },
  schedule_timeSlotWrapper: {
    textAlign: 'center',
    width: '100%',
  },
  schedule_containerTimeSlotWrapper: {
    flex: '1 0 0',
  },
  schedule_heightContainer: {
    overflow: 'hidden',
    [theme.breakpoints.down('xs')]: {
      height: 'inherit !important',
    },
  },
  schedule_policySizeTitle: {
    fontSize: 24,
    lineHeight: '1.25em',
    color: '#403f3f',
    margin: 0,
  },
  schedule_policySizeContent: {
    color: '#403f3f',
  },
  schedule_height: {
    height: 325,
  },
  schedule_scheduleMainStyle: {
    '& .rbc-month-view': {
      borderRadius: 4,
    },
    '& .rbc-month-row': {
      display: 'flex',
      justifyContent: 'center',
      marginLeft: '-1px',
    },
    '& .rbc-date-cell': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 0,
      height: '100%',
    },
    '& .rbc-row-content': {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'center',
    },
    '& .rbc-row-content .rbc-row:nth-child(2)': {
      position: 'absolute',
      width: '100%',
      top: 0,
    },
    '& .rbc-day-bg rbc-off-range-bg': {
      display: 'none',
    },
    '& .rbc-header': {
      padding: 0,
      [theme.breakpoints.down('xs')]: {
        whiteSpace: 'inherit !important',
      },
    },
    '& .rbc-event': {
      backgroundColor: 'transparent',
    },
    '& .rbc-row-segment': {
      padding: 0,
    },
    '& .rbc-allday-cell': {
      display: 'none',
    },
    '& .rbc-time-view': {
      borderRadius: 5,
    },
    '& .rbc-row': {
      flex: 1,
    },
  },
  schedule_containerToolbar: {
    alignItems: 'center',
  },
  titleContainer: {
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      justifyContent: 'center',
    },
  },

})
export default style
