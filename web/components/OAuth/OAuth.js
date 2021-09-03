import {withTranslation} from 'react-i18next'
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import {FacebookLoginButton, GoogleLoginButton} from 'react-social-login-buttons';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import styles from './OAuthStyle';
import Divider from '@material-ui/core/Divider';


class OAuth extends Component {

  components = {
    google: GoogleLoginButton,
    facebook: FacebookLoginButton,
  };

  startAuth = () => {
    const {provider} = this.props;
    Router.push(`/myAlfred/api/authentication/${provider}`);
  };

  render() {
    const {provider, login} = this.props;
    const {classes} = this.props;
    const ProviderLoginButton = this.components[provider];

    console.log(provider, 'provider');

    return (
      <Grid>
        <Grid container className={classes.contentOauth} onClick={this.startAuth}>
          <Grid style={{margin: 10}}>
            <img src={`/static/assets/img/${provider}.png`} alt={provider} title={provider} width={20}/>
          </Grid>
          <Grid>
            <Divider orientation="vertical" flexItem/>
          </Grid>
          <Grid>
            <p style={{
              color: 'rgba(0, 0, 0, 0.54)',
              fontSize: '1rem',
              fontFamily: 'Helvetica',
              fontWeight: 400,
              lineHeight: 1,
            }}
            >
              {login ? `Connexion ${provider}` : `Inscription ${provider}`}
            </p>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

OAuth.propTypes = {
  provider: PropTypes.string.isRequired,
  // Login : true => connect, false : register
  login: PropTypes.string.isRequired,
};

export default withTranslation()(withStyles(styles)(OAuth))
