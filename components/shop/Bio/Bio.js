import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
//import BioCard from './BioCard/BioCard';
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import axios from "axios";
import Router from "next/router";
const { config } = require('../../../config/config');
const url = config.apiUrl;

const styles = theme => ({
  container: {
    paddingRight: 15,
    paddingLeft: 15,
    marginTop: '5rem',
    marginBottom: '5rem',
    marginRight: 'auto',
    marginLeft: 'auto',
    width: '100%',

    // Full width for (xs, extra-small: 0px or larger) and (sm, small: 600px or larger)
    [theme.breakpoints.up('xs')]: { // medium: 960px or larger
      flexDirection: 'column',
    },
    [theme.breakpoints.up('md')]: { // medium: 960px or larger
      width: 920,
    },
    [theme.breakpoints.up('lg')]: { // large: 1280px or larger
      width: 1170,
    },
    [theme.breakpoints.up('xl')]: { // extra-large: 1920px or larger
      width: 1366,
    },
  },
  title: {
    fontSize: '1.5em',
    marginTop: '2rem',
    marginBottom: '2rem',
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    [theme.breakpoints.down('md')]: {
      alignSelf: 'center',
    },
  },
  avatar: {
    height: 100,
    width: 100,
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'block'
  },
  biography: {
    padding: '2rem',
    borderRadius: 10,
  },
  text: {
    margin: '1rem 0 .5rem 0',
  },
  allContainer: {
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  biographyContainer: {
    [theme.breakpoints.down('xs')]: {
      alignSelf: 'center',
    },
  },
});

class bio extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      shop: [],
      alfred: [],
      currentAddress: '',
      currentCity: '',
      currentZip_code: '',
      currentCountry: '',
      user: [],
      description: '',
      addressCity: {}
    };
  }

  componentDidMount() {
    let self = this;


    const id_alfred = self.props.shop;

    


    axios.get(`${url}myAlfred/api/shop/alfred/${id_alfred}`)
        .then( (response) =>  {

          let shop = response.data;


          this.setState({
            shop: shop,
            alfred: shop.alfred,
          })

          this.setState({
            addressCity : this.state.alfred.billing_address,
          })



        })
        .catch(function (error) {
          console.log(error);
        });

        localStorage.setItem('path',Router.pathname);
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        axios
            .get(url+'myAlfred/api/users/current')
            .then(res => {
                let user = res.data;
                this.setState({user:user});


                if(typeof user.billing_address != 'undefined') {
                    this.setState({address: true, currentAddress: user.billing_address.address,currentCity: user.billing_address.city,
                        currentZip_code: user.billing_address.zip_code,currentCountry: user.billing_address.country})
                } else {
                    this.setState({address:false})
                }
                this.setState({service_address: user.service_address});

            })
            .catch(err => {
                    console.log(err);
                    if(err.response.status === 401 || err.response.status === 403) {
                        localStorage.removeItem('token');
                        Router.push({pathname: '/login'})
                    }
                }
            );

  }

  render() {


    const {classes} = this.props;
    const {alfred} = this.state;
    const {addressCity} = this.state;
    const {shop} = this.state;

    return (
        <Fragment>
          <Grid container className={classes.container} spacing={24}>
            <Grid container className={classes.allContainer}>
              <Grid item xs={12} md={4} className={classes.avatarContainer}>
                <Avatar alt="John Doe" src={`../../../../${alfred.picture}`} className={classes.avatar} />
                <Typography className={classes.text}>{alfred.name} {alfred.firstname}</Typography>
                <Typography> {addressCity.city} </Typography>
              </Grid>
              <Grid item xs={12} md={8} className={classes.biographyContainer}>
                <Card className={classes.biography}>
                  <Typography>
                    {alfred.description}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Fragment>
    );
  }
}

export default withStyles(styles)(bio);
