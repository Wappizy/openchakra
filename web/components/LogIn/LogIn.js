import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import styles from './LogInStyle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Link from 'next/link';
import Button from '@material-ui/core/Button';
const  {setAuthToken, setAxiosAuthentication}=require('../../utils/authentication')
import axios from 'axios';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import OAuth from '../OAuth/OAuth';

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
const {snackBarError}=require('../../utils/notifications')
const {is_development}=require('../../config/config')
const {PROVIDERS} = require('../../utils/consts');
const {ENABLE_GF_LOGIN} = require('../../config/config');

class LogIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      errors: {},
      showPassword: false,
    };
  }

  onChange = e => {
    this.setState({[e.target.name]: e.target.value});
  };

  onSubmit = e => {
    e.preventDefault();

    const user = {
      username: this.state.username,
      password: this.state.password,
    };

    if (is_development()) {
      user.role = 'ADMIN'
    }

    axios.post('/myAlfred/api/users/login', user)
      .then(res => {
        setAuthToken()
        setAxiosAuthentication()
        axios.put('/myAlfred/api/users/account/lastLogin')
          .then(data => {
            let path = localStorage.getItem('path');
            this.props.login();
          })
          .catch(err => console.error(err));
      })
      .catch(err => {
        console.error(err);
        if (err.response) {
	  snackBarError(err.response.data)
          this.setState({errors: err.response.data});
        }
      });
  };

   handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  handleMouseDownPassword = (event) =>{
    event.preventDefault();
  };

  render() {
    const {classes, callRegister, id} = this.props;
    const {errors, username, password, showPassword} = this.state;
    return (
      <Grid className={classes.fullContainer}>
        <Grid style={{width: '100%'}}>
          <Grid className={classes.newContainer}>
            <Grid>
              <h2 className={classes.titleRegister}>Connexion</h2>
            </Grid>
            {ENABLE_GF_LOGIN ?
              <Grid className={classes.margin}>
                <Grid container spacing={1} alignItems="flex-end" className={classes.genericContainer}>
                  <Grid className={classes.margin}>
                    <Grid container spacing={1} alignItems="flex-end" className={classes.flexContainerPics}>
                      <Grid style={{width: '100%'}}>
                        {PROVIDERS.map(provider =>
                          <OAuth
                            login={true}
                            provider={provider}
                            key={provider}
                          />,
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid className={classes.margin}>
                    <Grid container spacing={1} alignItems="flex-end" className={classes.flexContainerPics}>
                      <Grid>
                        <h3 style={{color: 'rgba(84,89,95,0.95)', fontWeight: 'bold', letterSpacing: -1}}>Ou</h3>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              :
              null
            }
            <Grid className={classes.containerDialogContent}>
              <form onSubmit={this.onSubmit} style={{marginBottom: 15}}>
                <Grid className={classes.margin}>
                  <Grid container spacing={1} alignItems="flex-end" className={classes.genericContainer}>
                    <Grid item>
                      <MailOutlineIcon className={classes.colorIcon}/>
                    </Grid>
                    <Grid item className={classes.widthTextField}>
                      <Input
                        label="Email"
                        placeholder="Email"
                        style={{width: '100%', marginTop: 16, marginBottom: 8}}
                        type="email"
                        name="username"
                        value={username}
                        onChange={this.onChange}
                        error={errors.username}
                      />
                      <em>{errors.username}</em>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid className={classes.margin}>
                  <Grid container spacing={1} alignItems="flex-end" className={classes.genericContainer}>
                    <Grid item>
                      <LockOpenOutlinedIcon className={classes.colorIcon}/>
                    </Grid>
                    <Grid item className={classes.widthTextField}>
                      <Input
                        id="standard-with-placeholder"
                        label="Mot de passe"
                        placeholder="Mot de passe"
                        style={{width: '100%', marginTop: 16, marginBottom: 8}}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={password}
                        onChange={this.onChange}
                        error={errors.password}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={this.handleClickShowPassword}
                              onMouseDown={this.handleMouseDownPassword}
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <em>{errors.password}</em>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>
                  <Button type="submit" variant="contained" color="primary" style={{width: '100%', color: 'white'}}>
                    Connexion
                  </Button>
                </Grid>
              </form>
            </Grid>
            <Grid item style={{display: 'flex', flexDirection: 'column', marginBottom: '10%'}}>
              <Link href={'/forgotPassword'}><a color="primary" style={{textDecoration: 'none', color: '#2FBCD3'}}>Mot
                de passe oublié ?</a></Link>
              <a color="primary" onClick={callRegister}
                 style={{textDecoration: 'none', color: '#2FBCD3', cursor: 'pointer'}}>Pas encore inscrit ?
                Inscrivez-vous !</a>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(LogIn);
