import React from 'react';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import FacebookIcon from '@material-ui/icons/Facebook';
import {NEWS_LETTER} from '../../../utils/i18n';
import axios from 'axios';
import EmailIcon from '@material-ui/icons/Email';
import InputAdornment from '@material-ui/core/InputAdornment';
import styles from '../../../static/css/components/NewsLetter/NewsLetter'
import withStyles from "@material-ui/core/styles/withStyles";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class NewsLetter extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      email: '',
      modalSubscription: false
    }
  }

  handleOnchange = (event) =>{
    this.setState({[event.target.name]: event.target.value})
  };

  handleSubmit = (event) => {
    event.preventDefault();

    var form_data = new FormData();

    const obj = {
      EMAIL: this.state.email,
      email_address_check: "",
      locale: "fr",
    };

    for ( var key in obj ) {
      form_data.append(key, obj[key]);
    }

    fetch('https://cef7ace9.sibforms.com/serve/MUIEAMozm6936onrqiPaove-mb4-eZhjKq9N50iJ7FVKRVk4NFAVimF-eRdZmyw9XmVuQh9ItQdDfS1NJLu11EDcUGdHWDoNY13qixwVVhV1R_OjaeI5i5iVjN7Jl86BzlIwoqHgutCV84BudSu-zdJ1Jrq0dAHZBFarwabS9kqbbKhRu9hK2T5XHv6cw8K5NdVf1hkL_BMB3hy7', {
      method: 'POST',
      mode: 'no-cors',
      body: form_data
    }).then(() => this.setState({modalSubscription: true})).catch(err => console.error(err));
  };


  render() {
    const {classes} = this.props;

    return (
      <Grid className={classes.newsLetterMainStyle}>
        <Grid className={classes.newsLetterMainContainer}>
          <Grid className={classes.newsLetterLeftContainer}>
            <Grid>
              <h2 className={classes.newsLetterTitle}>{NEWS_LETTER.title}</h2>
            </Grid>
            <Grid>
              <p className={classes.newsLetterSubTitle}>{NEWS_LETTER.text}</p>
            </Grid>
          </Grid>
          <Grid className={classes.newsLetterRightContainer}>
            {/****TODO when googleAuth avail <Grid className={style.newsLetterContainer}>
              <Button
                variant="outlined"
                classes={{root : style.newsLetterButtonGoogle}}
                startIcon={<FacebookIcon />}
              >
                {NEWS_LETTER.google}
              </Button>
            </Grid>
            <Grid >
              <p className={style.newsLetterText}>{NEWS_LETTER.where}</p>
            </Grid>***/}
            <Grid className={classes.newsLetterContainer}>
              <Grid>
                <TextField
                  id="outlined-basic"
                  placeholder="Email"
                  variant="outlined"
                  name="email"
                  classes={{root: classes.newsLetterTextField}}
                  InputLabelProps={{ shrink: false }}
                  onChange={this.handleOnchange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" >
                        <EmailIcon className={classes.newsLetterEmailIcon}/>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Grid className={classes.newsLetterContainer}>
              <Grid>
                <Button style={{ width: '100%'}} variant={'outlined'} classes={{root : classes.newsLetterButton}} onClick={this.handleSubmit}>{NEWS_LETTER.button}</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Dialog
          open={this.state.modalSubscription}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => this.setState({modalSubscription: false})}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">{"Use Google's location service?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Let Google help apps determine location. This means sending anonymous location data to
              Google, even when no apps are running.
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </Grid>
    );
  }
}

export default withStyles (styles) (NewsLetter);
