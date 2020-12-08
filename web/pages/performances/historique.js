const {setAxiosAuthentication}=require('../../utils/authentication')
import React, {Fragment} from 'react';
import Layout from '../../hoc/Layout/Layout';
import axios from 'axios';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Router from 'next/router';
import {withStyles} from '@material-ui/core/styles';
import {Typography} from '@material-ui/core';
import NavBarShop from '../../components/NavBar/NavBarShop/NavBarShop';
import NavbarMobile from '../../components/NavbarMobile/NavbarMobile';
import ResponsiveDrawer from '../../components/ResponsiveDrawer/ResponsiveDrawer';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import styles from './historique/historiqueStyle';
import cookie from 'react-cookies';

moment.locale('fr');


class Historique extends React.Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      tabs: false,
      bookingsPaid: [],
      bookingsPaidSoon: [],
      userId: '',
    };
    this.callDrawer = this.callDrawer.bind(this);
  }

  componentDidMount() {

    localStorage.setItem('path', Router.pathname);
    setAxiosAuthentication()

    axios.get('/myAlfred/api/booking/getPaid')
      .then(res => {
        let bookingsPaid = res.data;
        this.setState({bookingsPaid: bookingsPaid});
      })
      .catch(err => console.error(err));

    axios.get('/myAlfred/api/booking/getPaidSoon')
      .then(res => {
        let bookingsPaidSoon = res.data;
        this.setState({bookingsPaidSoon: bookingsPaidSoon});
      })
      .catch(err => console.error(err));

    axios.get('/myAlfred/api/users/current').then(res => {
      let user = res.data;
      if (user) {
        this.setState({
          userId: user._id,
        });
      }
    }).catch(function (error) {
      console.log(error);
    });

  }

  handleClicktabs2 = () => {
    this.setState({tabs: true});
  };

  handleClicktabs = () => {
    this.setState({tabs: false});
  };

  callDrawer() {
    this.child.current.handleDrawerToggle();
  }

  render() {
    const {classes} = this.props;
    const {tabs} = this.state;
    const {bookingsPaid} = this.state;
    const {bookingsPaidSoon} = this.state;


    return (
      <Fragment>
        <Layout>
          <Grid container className={classes.bigContainer}>
            <NavBarShop userId={this.state.userId}/>
            <Grid className={classes.toggle}>
              <Grid>
                <ResponsiveDrawer ref={this.child} isActiveIndex={3} itemsDrawers={'performance'} needMargin={true}/>
              </Grid>
              <Grid>
                <Grid>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={this.callDrawer}
                    className={classes.menuButton}
                  >
                    <MenuIcon/>
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item className={classes.myHistorique}>
              <Grid container>
                <Grid item style={{textAlign: 'center', width: '50%'}}>
                  <div>
                    <h2 onClick={this.handleClicktabs} style={{
                      color: '#828181',
                      fontWeight: '100',
                      cursor: 'pointer',
                      marginLeft: '0%',
                      position: 'sticky',
                    }}>Versements reçus</h2>
                  </div>
                </Grid>
                <Grid item style={{textAlign: 'center', width: '50%'}}>
                  <h2 onClick={this.handleClicktabs2}
                      style={{color: '#828181', fontWeight: '100', textAlign: 'center', cursor: 'pointer'}}>Versements à
                    venir</h2><br/>
                </Grid>

                <Grid item style={{textAlign: 'center', width: '50%'}}>
                  {tabs ?
                    <React.Fragment>
                      <hr className={classes.trait1} style={{marginTop: '-10px'}}/>
                    </React.Fragment>
                    :
                    <React.Fragment>
                      <hr className={classes.trait3} style={{marginTop: '-10px'}}/>
                    </React.Fragment>}
                </Grid>
                <Grid item style={{textAlign: 'center', width: '50%'}}>
                  {tabs ?
                    <React.Fragment>
                      <hr className={classes.trait} style={{marginTop: '-10px'}}/>
                    </React.Fragment>
                    :
                    <React.Fragment>
                      <hr className={classes.trait2} style={{marginTop: '-10px'}}/>
                    </React.Fragment>}
                </Grid>

              </Grid>
              <Grid container className={classes.tabmobile}>
                <Grid item style={{textAlign: 'center', width: '50%'}}>
                  <h2 onClick={this.handleClicktabs}
                      style={{color: '#828181', fontWeight: '100', cursor: 'pointer', marginLeft: '25%'}}>Versement
                    reçu</h2>
                </Grid>
                <Grid item style={{textAlign: 'center', width: '50%'}}>
                  <h2 onClick={this.handleClicktabs2}
                      style={{color: '#828181', fontWeight: '100', textAlign: 'center', cursor: 'pointer'}}>Versements à
                    venir</h2><br/>
                </Grid>

                <Grid item style={{textAlign: 'center', width: '50%'}}>
                  {tabs ?
                    <React.Fragment>
                      <hr className={classes.trait1}/>
                    </React.Fragment>
                    :
                    <React.Fragment>
                      <hr className={classes.trait3}/>
                    </React.Fragment>}
                </Grid>
                <Grid item style={{textAlign: 'center', width: '50%'}}>
                  {tabs ?
                    <React.Fragment>
                      <hr className={classes.trait}/>
                    </React.Fragment>
                    :
                    <React.Fragment>
                      <hr className={classes.trait2}/>
                    </React.Fragment>}
                </Grid>


              </Grid>

              <Grid container style={{marginBottom: 20, marginTop: '50px'}}>
                {tabs ?
                  <React.Fragment>
                    <Grid className={classes.historesp} container>
                      {bookingsPaidSoon.map((e, index) => (
                        <Grid key={index} style={{borderBottom: '#9f919178 solid 1px', alignItems: 'center'}}>
                          <Grid item xs={8}>
                            <Typography style={{marginBottom: '30px', fontSize: '1.1rem'}}>Prestation terminée
                              le {moment(e.end_date).format('DD/MM/YYYY')}</Typography>
                            <Typography style={{
                              marginBottom: '30px',
                              fontSize: '1.1rem',
                            }}>{e.user.firstname} - {e.date_prestation} - {e.service}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography style={{
                              color: '#26A7C6',
                              textAlign: 'center',
                              marginTop: '20px',
                              fontSize: '1.5rem',
                            }}>{e.alfred_amount.toFixed(2)}€</Typography>
                          </Grid>
                        </Grid>
                      ))}

                    </Grid>
                  </React.Fragment>
                  :
                  <React.Fragment>
                    <Grid className={classes.historesp} container>
                      {bookingsPaid.map((e, index) => (
                        <Grid key={index} container style={{borderBottom: '#9f919178 solid 1px', alignItems: 'center'}}>
                          <Grid item xs={8}>
                            <Typography style={{marginBottom: '30px', fontSize: '1.1rem'}}>Prestation payée
                              le {moment(e.date_payment).format('DD/MM/YYYY')}</Typography>
                            <Typography style={{
                              marginBottom: '30px',
                              fontSize: '1.1rem',
                            }}>{e.user.firstname} - {e.date_prestation} - {e.service}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography style={{
                              color: '#26A7C6',
                              textAlign: 'center',
                              marginTop: '20px',
                              fontSize: '1.5rem',
                            }}>{e.alfred_amount.toFixed(2)}€</Typography>
                          </Grid>
                        </Grid>
                      ))}

                    </Grid>
                  </React.Fragment>
                }
              </Grid>
            </Grid>


          </Grid>
        </Layout>
        <NavbarMobile userId={this.state.userId}/>
      </Fragment>
    );
  };
}


export default withStyles(styles)(Historique);
