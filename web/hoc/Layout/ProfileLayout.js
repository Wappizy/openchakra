const {setAxiosAuthentication} = require('../../utils/authentication')
import React from 'react'
import Layout from '../../hoc/Layout/Layout'
import Grid from "@material-ui/core/Grid";
import ScrollMenu from '../../components/ScrollMenu/ScrollMenu';
import axios from 'axios'
const {isEditableUser}=require('../../utils/functions');
const {is_b2b_site}=require('../../utils/context')
import styles from '../../static/css/components/Layout/ProfileLayout/ProfileLayout'
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import UserAvatar from "../../components/Avatar/UserAvatar";
import {is_mode_company} from "../../utils/context";

class ProfileLayout extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      company: null
    };
    this.nonlogged_items = [
      {label: 'À propos', url: '/about'},
      {label: 'Services', url: '/services'},
      //{ label: 'Photos', url: '/pictures' }, TODO : Albums 899538 899547
      {label: 'Avis', url: '/reviews'},
    ]
    this.logged_items = [
      {label: 'À propos', url: '/about'},
      {label: 'Mes services', url: '/services'},
      //{ label: 'Mes photos', url: '/pictures' }, TODO : Albums 899538 899547
      {label: 'Mes avis', url: '/reviews'},
    ];
    this.logged_alfred_items = [
      {label: 'À propos', url: '/about'},
      {label: 'Mes services', url: '/services'},
      //{ label: 'Mes photos', url: '/pictures' }, TODO : Albums 899538 899547
      {label: 'Mes avis', url: '/reviews'},
      {label: 'Mon calendrier', url: '/calendar'},
      {label: 'Mes statistiques', url: '/statistics'}
    ];
  }

  componentDidMount = () => {
    setAxiosAuthentication()
    axios.get(`/myAlfred/api/users/users/${this.props.user}`)
      .then(res => {
        this.setState({user: res.data})
      })
      .catch(err => console.error(err))

    axios.get('/myAlfred/api/companies/current').then( res =>{
      const company = res.data;
      this.setState({
        company: company,
      })
    }).catch(err => console.error(err))
  };

  render() {
    const {items, user, company} = this.state;
    const {children, index, classes} = this.props;

    if (!user) {
      return null
    }

    const menuItems = isEditableUser(this.props.user) ? user.is_alfred ?
      this.logged_alfred_items : this.logged_items : this.nonlogged_items;

    return (
      <Layout user={user}>
        <Grid className={classes.profilLayoutMainContainer}>
          <Grid className={classes.profilLayoutContainer}>
            <Grid className={classes.profilLayoutBackgroundContainer}>
              <Grid className={classes.profilLayoutMargin}>
                <Grid className={classes.profilLayoutBox}>
                  <Grid className={is_b2b_site() ? classes.profilLayoutBannerImgPro : classes.profilLayoutBannerImg}>
                    <Grid className={classes.profilLayoutAvatar}>
                      <UserAvatar alt={!is_mode_company() ? user.firstname : company ? company.name : ''} user={!is_mode_company() ? user : company ? company : ''} className={classes.cardPreviewLarge}/>
                    </Grid>
                  </Grid>
                  <Grid style={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: '40%',
                    alignItems: 'center'
                  }}>
                    <Grid style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                      <Grid>
                        {is_mode_company() ?
                          <h3>{company ? company.name : ''}</h3>
                          :
                          <h3>{`Je m'appelle ${user ? user.firstname : ''}`}</h3>
                        }
                      </Grid>
                      {is_mode_company() ? null :
                        <Grid>
                          <Typography style={{color: 'rgba(39,37,37,35%)'}}>et j’ai hâte de vous rencontrer !</Typography>
                        </Grid>
                      }

                    </Grid>
                  </Grid>
                  {
                    !is_mode_company() ?
                      <Grid className={classes.profilLayoutScrollMenu}>
                        <ScrollMenu categories={menuItems} mode={'profile'} indexCat={index}
                                    extraParams={{user: this.props.user}}/>
                      </Grid> : null}
                </Grid>
              </Grid>
              <Grid className={classes.profilLayoutChildren}>
                {children}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Layout>
    )
  }
}

export default withStyles(styles)(ProfileLayout);
