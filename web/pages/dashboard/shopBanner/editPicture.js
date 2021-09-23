import {Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import Router from 'next/router';
import axios from 'axios';

import {snackBarSuccess} from '../../../utils/notifications';
import Layout from '../../../hoc/Layout/Layout';

const {clearAuthenticationToken, setAxiosAuthentication} = require('../../../utils/authentication')


const styles = {
  loginContainer: {
    alignItems: 'center',
    height: '100vh',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  card: {
    padding: '1.5rem 3rem',
    width: 400,
  },
  cardContant: {
    flexDirection: 'column',
  },
  linkText: {
    textDecoration: 'none',
    color: 'black',
    fontSize: 12,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
};


class editPicture extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      banner: {},
      picture: null,

    };


  }

  static getInitialProps({query: {id}}) {
    return {banner_id: id};

  }

  componentDidMount() {
    localStorage.setItem('path', Router.pathname);
    const id = this.props.banner_id;
    setAxiosAuthentication()
    axios.get(`/myAlfred/api/admin/shopBanner/all/${id}`)
      .then(response => {
        let banner = response.data;
        this.setState({banner: banner});

      })
      .catch(err => {
        console.error(err);
        if (err.response.status === 401 || err.response.status === 403) {
          clearAuthenticationToken()
          Router.push({pathname: '/login'});
        }
      });


  }

  onChange = e => {
    this.setState({picture: e.target.files[0]});
  };


  onSubmit = e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('picture', this.state.picture);
    const id = this.props.banner_id;
    axios.post(`/myAlfred/api/admin/shopBanner/editPicture/${id}`, formData)
      .then(res => {
        snackBarSuccess('Photo modifiée avec succès');
        Router.push({pathname: '/dashboard/shopBanner/all'});
      })
      .catch(err => {
        console.error(err);
        clearAuthenticationToken()
        Router.push({pathname: '/login'});
      });


  };


  render() {
    const {classes} = this.props;
    const {banner} = this.state;


    return (
      <Layout>
        <Grid container className={classes.loginContainer}>
          <Card className={classes.card}>
            <Grid>
              <Grid item style={{display: 'flex', justifyContent: 'center'}}>
                <Typography style={{fontSize: 30}}>{banner.label}</Typography>
              </Grid>
              <form onSubmit={this.onSubmit}>
                <img src={`../../../${banner.picture}`} alt='image' width={100}/>
                <Grid item>
                  <input type="file" name="picture" onChange={this.onChange} accept="image/*"/>
                </Grid>


                <Grid item style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>
                  <Button type="submit" variant="contained" color="primary" style={{width: '100%'}}>
                    Modifier
                  </Button>


                </Grid>
              </form>
            </Grid>
          </Card>
        </Grid>
      </Layout>
    );
  };
}


export default withStyles(styles)(editPicture);
