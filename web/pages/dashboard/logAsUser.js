const {clearAuthenticationToken}=require('../../utils/authentication')
const {setAxiosAuthentication}=require('../../utils/authentication')
const {setAuthToken}=require('../../utils/authentication')
import React from 'react';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import {Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Layout from '../../hoc/Layout/Layout';
import axios from 'axios';
import Router from 'next/router';
//import Select from "@material-ui/core/Select";
import Select from 'react-dropdown-select';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';


const styles = {
  loginContainer: {
    alignItems: 'center',
    height: '85vh',
    justifyContent: 'center',
    flexDirection: 'column',
    marginTop: '5%',
  },
  card: {
    padding: '1.5rem 3rem',
    width: 500,
    height: '100%',
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

class logAsUser extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      errors: null,
    };

    this.onUserChanged = this.onUserChanged.bind(this);
  }

  componentDidMount() {
    localStorage.setItem('path', Router.pathname);
    setAxiosAuthentication()
    axios.get(`/myAlfred/api/admin/users/all_light`)
      .then(response => {
        let users = response.data;
        const muUsers = users.map(u => {
          return {
            label: `${u.name} ${u.firstname} ${u.email}`,
            value: u.email,
            key: u.id,
          };
        });
        this.setState({muUsers: muUsers});

      })
      .catch(err => {
        console.error(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          clearAuthenticationToken()
          Router.push({pathname: '/login'});
        }
      });
  }

  onUserChanged = e => {
    this.setState({user: e[0].value});
  };

  onSubmit = e => {
    e.preventDefault();

    setAxiosAuthentication()
    axios.post('/myAlfred/api/admin/loginAs', {username: this.state.user})
      .then(res => {
        setAuthToken()
        Router.push('/');
      })
      .catch(err => {
        console.error(err);
        if (err.response) {
          this.setState({errors: err.response.data});
        }
      });
  };

  render() {
    const {classes} = this.props;
    const {muUsers, user} = this.state;

    return (
      <Layout>
        <Grid container className={classes.loginContainer}>
          <Card className={classes.card}>
            <Grid>
              <Grid item style={{display: 'flex', justifyContent: 'center'}}>
                <Typography style={{fontSize: 30}}>Maintenance</Typography>
              </Grid>
              <form onSubmit={this.onSubmit}>
                <Grid item style={{width: '100%'}}>
                  <Typography style={{fontSize: 20}}>Se connecter en tant que</Typography>
                  <FormControl className={classes.formControl} style={{width: '100%'}}>
                    <Select
                      input={<Input name="user" id="genre-label-placeholder"/>}
                      displayEmpty
                      name="user"
                      onChange={this.onUserChanged}
                      options={muUsers}
                      multi={false}
                    >
                    </Select>
                  </FormControl>

                </Grid>
                <em style={{color: 'red'}}>{this.state.errors}</em>
                <Grid item style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>
                  <Button type="submit" variant="contained" color="primary" style={{width: '100%'}}
                          disabled={!user}>
                    Connexion
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


export default withStyles(styles)(logAsUser);
