const {setAxiosAuthentication}=require('../../utils/authentication')
import React from 'react';
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Router from "next/router";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import MobileNavbar from "./NavBar/MobileNavbar";
import withStyles from "@material-ui/core/styles/withStyles";
import styles from '../../static/css/components/Layout/LayoutMobileProfile/LayoutMobileProfile'
import axios from "axios";
import Typography from "@material-ui/core/Typography";
import ScrollMenu from "../../components/ScrollMenu/ScrollMenu";
import Divider from "@material-ui/core/Divider";
import UserAvatar from "../../components/Avatar/UserAvatar";
import {isEditableUser, isModeCompany, isB2BStyle} from "../../utils/context";

class LayoutMobileProfile extends React.Component{

  constructor(props) {
    super(props);
    this.state= {
      currentUrlIndex: '',
      myProfilUrl: false,
      user: null,
      company: null
    };
    this.nonlogged_items= [
      { label: 'À propos', url: '/about' },
      { label: 'Services', url: '/services' },
      //{ label: 'Photos', url: '/pictures' }, TODO : Albums 899538 899547
      { label: 'Avis', url: '/reviews' },
    ]
    this.logged_items= [
      { label: 'À propos', url: '/about' },
      { label: 'Mes services', url: '/services' },
      //{ label: 'Mes photos', url: '/pictures' }, TODO : Albums 899538 899547
      { label: 'Mes avis', url: '/reviews' },
    ];
    this.logged_alfred_items = [
      { label: 'À propos', url: '/about' },
      { label: 'Mes services', url: '/services' },
      //{ label: 'Mes photos', url: '/pictures' }, TODO : Albums 899538 899547
      { label: 'Mes avis', url: '/reviews' },
      { label: 'Mon calendrier', url: '/calendar' },
      { label: 'Mes statistiques', url: '/statistics'}
    ];
  }

  componentDidMount = () =>{
    setAxiosAuthentication()
    axios.get(`/myAlfred/api/users/users/${this.props.user}`)
      .then( res => {
        this.setState( { user: res.data})
      })
      .catch (err => console.error(err));

    axios.get('/myAlfred/api/companies/current').then( res =>{
      const company = res.data;
      this.setState({
        company: company,
      })
    }).catch(err => console.error(err))
  };

  render() {
    const{children, classes, currentIndex} = this.props;
    const{user, company} = this.state;

    if (!user) {
      return null
    }

    const menuItems = isEditableUser(this.props.user) ? user.is_alfred ? this.logged_alfred_items : this.logged_items : this.nonlogged_items;



    return(
      <Grid>
        <Grid>
          <Grid className={isB2BStyle() ? classes.layoutMobileProfilHeaderPro : classes.layoutMobileProfilHeader}>
            <IconButton aria-label="ArrowBackIosIcon" onClick={() => Router.back()}>
              <ArrowBackIosIcon />
            </IconButton>
          </Grid>
          <Grid className={classes.layoutMobileLayoutProfileHeader}>
            <Grid className={classes.profilLayoutAvatar}>
              <UserAvatar alt={!isModeCompany(user) ? user.firstname : company ? company.name : ''} user={!isModeCompany(user) ? user : company ? company : ''}/>
            </Grid>
          </Grid>
          <Grid style={{display: 'flex',height: '40%', alignItems: 'center', marginTop: '10vh', marginLeft: '5vh'}}>
            <Grid style={{display: 'flex',flexDirection: 'column'}}>
              <Grid>
                {isModeCompany(user) ?
                  <h3>{company ? company.name : ''}</h3>
                  :
                  <h3>{`Je m'appelle ${user ? user.firstname : ''}`}</h3>
                }
              </Grid>
              {isModeCompany(user) ? null :
                <Grid>
                  <Typography style={{color: 'rgba(39,37,37,35%)'}}>et j’ai hâte de vous rencontrer !</Typography>
                </Grid>
              }
            </Grid>
          </Grid>
        </Grid>
        <Grid style={{marginTop: '5vh'}}>
          <Divider/>
        </Grid>
        {
          isModeCompany(user) ? null :
            <Grid className={classes.profilLayoutScrollMenu}>
              <ScrollMenu categories={menuItems} mode={'profile'} extraParams={{user: this.props.user}}/>
            </Grid>
        }
        <Grid style={{padding: '10%'}}>
          {children}
        </Grid>
        <Grid style={{position: 'fixed', bottom: '3%', display: 'flex', justifyContent: 'center', width: '100%', zIndex: 4}}>
          <Grid style={{width: '100%'}}>
            <MobileNavbar currentIndex={currentIndex}/>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles (styles) (LayoutMobileProfile);
