import React from 'react';
import {Calendar, momentLocalizer, Views} from 'react-big-calendar';
import _ from 'lodash';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import {bookings2events} from '../../utils/converters';
import {Typography} from '@material-ui/core';
import styles from './ScheduleStyle';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';

const {isDateAvailable, isMomentAvailable} = require('../../utils/dateutils');
moment.locale('fr');

const localizer = momentLocalizer(moment);

/***TODO nbSchedule size manage by parent not itself
 ***/

class Schedule extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      eventsSelected: new Set(),
      dayLayoutAlgorithm: 'no-overlap',
      view: Views.MONTH,
      currentDate: new Date(),
      half: Math.floor(props.nbSchedule / 2),
    };
  }

  toggleSelection = ({start, end, action}) => {
    // Don't select dates before today
    if (moment(start).isBefore(moment().startOf('day'))) {
      return
    }
    let newDate = moment(start).format('YYYY-MM-DD');
    var eventsSelected=this.state.eventsSelected;
    // Single selection : replace
    if (this.props.singleSelection) {
      eventsSelected = new Set([newDate])
    }
    // Multiple selection : toggle
    else {
      if (!eventsSelected.delete(newDate)) { eventsSelected.add(newDate) }
    }
    this.setState(
      { eventsSelected: eventsSelected},
      () => this.props.handleSelection(this.state.eventsSelected, start, this.props.mode)
    )
  };

  removeEventsSelected = () => {
    this.setState({eventsSelected: new Set()})
  };

  nextMonth = () => {
      let date = new Date(this.state.currentDate);
      date.setDate(1);
      date.setMonth(date.getMonth() + 1);
      this.setState({currentDate : date})
  };

  render() {
    const {classes, title, subtitle, selectable, height, nbSchedule, bookings, mode} = this.props;
    const {view, eventsSelected, currentDate, half} = this.state;

    let events = [];
    if (bookings !== undefined) {
      events = bookings2events(bookings.filter(b => b.calendar_display));
    }

    if (view === Views.MONTH) {
      events = _.uniqBy(events, e => e.start.format('DD/MM/YYYY'));
    }

    const customToolbar = (toolbar) => {
      const goToBack = () => {
        if(this.props.mode === 'month'){
          toolbar.date.setMonth(toolbar.date.getMonth() - 1);
          toolbar.onNavigate('prev');
        }else{
          toolbar.onNavigate('PREV');
        }
      };

      const goToNext = () => {
        if(this.props.mode === 'month'){
          toolbar.date.setMonth(toolbar.date.getMonth() + 1);
          toolbar.onNavigate('prev');
        }else{
          toolbar.onNavigate('NEXT');
        }
      };

      const label = () => {
        const date = moment(toolbar.date);
        return (
          <Grid container
                style={{alignItems: 'center', justifyContent: this.props.nbSchedule === 1 ? 'space-between' : 'center'}}>
            {
              this.props.nbSchedule === 1 ?
                <Grid item>
                  <Button onClick={goToBack} variant={'contained'}>&#8249;</Button>
                </Grid> : null
            }
            <Grid item>
              <span>{date.format('MMMM') + ' ' + date.format('YYYY')}</span>
            </Grid>
            {
              this.props.nbSchedule === 1 ?
                <Grid item>
                  <Button onClick={goToNext} variant={'contained'}>&#8250;</Button>
                </Grid> : null
            }
          </Grid>
        );
      };

      return (
        <Grid container>
          <Grid className={classes.customToolbarStyle}>
            <Grid style={{width: '100%'}}>
              <Grid>{label()}</Grid>
            </Grid>
          </Grid>
        </Grid>
      );
    };


    const customMonthDateHeader = (event) => {
      let newDate = moment(event.date).format('YYYY-MM-DD');
      if (event.isOffRange) {
        return null
      }
      else if (moment(event.date).isBefore(moment().startOf('day'))) {
        return <p style={{ color: '#999999'}}>{event.label}</p>
      }
      else {
        return (
          <Grid className={classes.containerLabelSelector}>
            <Grid className={eventsSelected.has(newDate) ? classes.labelSelectorActive : classes.labelSelector}>
              <p style={{cursor: 'pointer', fontWeight: 'initial'}}>{event.label}</p>
            </Grid>
          </Grid>
        )
      }
    };

    const customMonthDateCellWrapper = (event) => {

      let propsStyle = event.children.props['className'];

      const m = moment(event.value);
      const isAvailable = isDateAvailable(m, this.props.availabilities);

      if (propsStyle === 'rbc-day-bg rbc-off-range-bg') {
        return (
          <Grid className={classes.off_range_style}/>
        );
      } else {
        if (isAvailable) {
          return (
            <Grid className={classes.day_style}/>
          );
        } else if (isAvailable && propsStyle === 'rbc-day-bg rbc-today') {
          return (
            <Grid className={classes.today_style_avail}>
              <Grid className={classes.today_style}/>
            </Grid>
          );
        } else if (!isAvailable && propsStyle === 'rbc-day-bg rbc-today') {
          return (
            <Grid className={classes.today_style_off}>
              <Grid className={classes.today_style}/>
            </Grid>
          );
        } else {
          return (
            <Grid className={classes.non_available_style}/>
          );
        }
      }
    };

    const customMonthEventWrapper = () => {
      return (
        <Grid className={classes.myEventWrapperStyle}/>
      );
    };

    const customWeekHeader = (header) => {
      const headerContent = () =>{
        const m = moment(header.date);
        return(
          <Grid container>
            <Grid item style={{width: '100%'}}>
              <span style={{color: m.isBefore(moment().startOf('day')) ? '#999999' : 'black'}}>
                {m.format('DD')}</span>
            </Grid>
          </Grid>
        )
      };

      return(
        <Grid>
          <Grid>
            {headerContent()}
          </Grid>
        </Grid>
      )
    };


    const customMyTimeSlotWrapper = (event) => {

      const label = () => {

        let date = moment(event.value);
        let resource = event.resource;
        const isAvailable = isMomentAvailable(date, this.props.availabilities);

        if(typeof resource === "undefined") {
          if (date.minutes() === 0){
            return(
              <Grid style={{textAlign: 'center', width : '100%'}}>
                <span>{date.hours() + ':' + date.format('mm')}</span>
              </Grid>
            )
          }
          else {
            return (
              <Grid/>
            )
          }
        }
        if (!isAvailable) {
          return(
            <Grid className={classes.non_available_style}/>
          )
        }
      };

      return(
        <Grid container style={{flex: '1 0 0'}}>
          {label()}
        </Grid>
      )
    };

    return (
      <Grid className={classes.heightContainer} style={{height: height, overflow: 'hidden'}}>
        {title || subtitle ?
          <Grid>
            {title ?
              <Grid>
                <Typography className={classes.policySizeTitle}>{title}</Typography>
              </Grid> : null
            }
            {subtitle ?
              <Grid>
                <p className={classes.sizeSchedulle}>{subtitle}</p>
              </Grid> : null
            }
          </Grid>
          : null
        }
        <Grid container style={{justifyContent: 'space-between'}}>
          <Grid>
            <Button>Back</Button>
          </Grid>
          <Grid>
            <Button  onClick={() => { this.nextMonth() }}>Suivant</Button>
          </Grid>
        </Grid>
        <Grid container spacing={2} style={{padding: 5}}>
          {[...Array(nbSchedule)].map((x, i) => {
            let date = new Date(currentDate);
            date.setDate(1);
            date.setMonth(date.getMonth() + (i - half));
            const monthStr = moment(date).format('M');
            const monthEvents = events.filter(e => moment(e.start).format('M') == monthStr);
            return (
              <Grid item xl={nbSchedule === 1 ? 11 : 4} lg={nbSchedule === 1 ? 11 : 4} md={nbSchedule === 1 ? 11 : 6}
                    sm={nbSchedule === 1 ? 11 : 6} xs={12} style={{height: 325}} key={i}>
                <Calendar
                  selectable={selectable}
                  popup={false}
                  culture={'fr-FR'}
                  localizer={localizer}
                  events={monthEvents}
                  views={[Views.MONTH, Views.WEEK]}
                  defaultView={mode}
                  defaultDate={date}
                  onSelectSlot={this.toggleSelection}
                  dayLayoutAlgorithm={this.state.dayLayoutAlgorithm}
                  scrollToTime={moment()}
                  messages={{
                    'today': 'Aujourd\'hui',
                    'previous': '<',
                    'next': '>',
                    'month': 'Mois',
                    'week': 'Semaine',
                    'day': 'Aujourd\'hui',
                    'agenda': 'Agenda',
                    'event': 'Evénement',
                    'date': 'Date',
                    'time': 'Horaires',
                    'noEventsInRange': 'Aucun évènement dans cette période',
                  }}
                  className={classes.sizeSchedulle}
                  components={{
                    /* event: MyEvent, // used by each view (Month, Day, Week)
                     *   eventWrapper: MyEventWrapper,
                     *   eventContainerWrapper: MyEventContainerWrapper,
                     *   dateCellWrapper: MyDateCellWrapper,
                     *   timeSlotWrapper: MyTimeSlotWrapper,
                     *   timeGutterHeader: MyTimeGutterWrapper,
                     *   toolbar: MyToolbar,
                     *   agenda: {
                     *   	 event: MyAgendaEvent // with the agenda view use a different component to render events
                     *     time: MyAgendaTime,
                     *     date: MyAgendaDate,
                     *   },
                     *   day: {
                     *     header: MyDayHeader,
                     *     event: MyDayEvent,
                     *   },
                     *   week: {
                     *     header: MyWeekHeader,
                     *     event: MyWeekEvent,
                     *   },
                     *   month: {
                     *     header: MyMonthHeader,
                     *     dateHeader: MyMonthDateHeader,
                     *     event: MyMonthEvent,
                     *   }*/
                    month: {
                      dateHeader: customMonthDateHeader,
                      eventWrapper: customMonthEventWrapper,
                      dateCellWrapper: customMonthDateCellWrapper,
                      toolbar: customToolbar,
                    },
                    week:{
                      toolbar: customToolbar,
                      header: customWeekHeader,
                      timeSlotWrapper: customMyTimeSlotWrapper,
                    }
                  }}
                />
              </Grid>
            );
            },
          )}
        </Grid>
      </Grid>
    );
  }
}

Schedule.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(Schedule);
