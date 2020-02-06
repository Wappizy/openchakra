import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import styles from '../static/assets/css/shopPage/shopPage'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AlfredBanner from '../components/shop/AlfredBanner/AlfredBanner';
import NavBarShop from '../components/NavBar/NavBarShop/NavBarShop';
import About from '../components/About/About';
import SkillsAlfred from '../components/SkillsAlfred/SkillsAlfred';
import Typography from '@material-ui/core/Typography';
import CardPreview from '../components/CardPreview/CardPreview';
import CardAddService from '../components/CardAddService/CardAddService';
import Layout from '../hoc/Layout/Layout';
import AlfredConditions from '../components/AlfredConditions/AlfredConditions';
import axios from 'axios';
import AlfredConditionsBooking from '../components/AlfredConditionsBooking/AlfredConditionsBooking';
import AlfredConditionsCancel from '../components/AlfredConditionsCancel/AlfredConditionsCancel';
import AlfredWelcomedMessage from '../components/AlfredWelcomedMessage/AlfredWelcomedMessage';
import Footer from '../hoc/Layout/Footer/Footer';
import {Helmet} from 'react-helmet';

const { config } = require('../config/config');
const url = config.apiUrl;

class shop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            alfred:[],
            id: '',
            shop:[],
            languages:[],
            services: [],
            userState: false,
            userId: '',
            isOwner:false,
            serviceUser:[],
            stateEditButtonFromAlfredCondtion: false,
            newWelcomedMessage: ""
        };
        this.needRefresh = this.needRefresh.bind(this);
        this.getStatusEditButton = this.getStatusEditButton.bind(this);
        this.getNewWelcomedMessage = this.getNewWelcomedMessage.bind(this);
    }

    static getInitialProps ({ query: { id_alfred } }) {
        return { aboutId: id_alfred }
    }

    componentWillMount() {
        this.setState({id: this.props.aboutId});
    }

    componentDidMount() {
        let self = this;

        axios.get(url+'myAlfred/api/users/current').then(res => {
            let user = res.data;
            if(user) {
                self.setState({
                    userState: true,
                    userId: user._id,
                })
            }
        }).catch(function (error) {
            console.log(error);
        });

        axios.get(`${url}myAlfred/api/shop/alfred/${this.state.id}`)
          .then( response  =>  {
              let shop = response.data;
              console.log(shop, 'shop')
              self.setState({
                  alfred: shop.alfred,
                  idAlfred: shop.alfred._id,
                  languages: shop.alfred.languages,
                  services: shop.services,
                  shop:shop,
              });
              self.checkIfOwner();
          })
          .catch(function (error) {
              console.log(error);
          });
    }

    checkIfOwner() {
        Object.keys(this.state.services).map( result =>{
            if(this.state.services[result].user === this.state.userId){
                this.setState({isOwner: true});
            }
        });
    }

    getStatusEditButton = (status) =>{
        this.setState({stateEditButtonFromAlfredCondtion : status});
    };

    getNewWelcomedMessage = (newMessage) =>{
        this.setState({newWelcomedMessage: newMessage});
    };


    needRefresh(){
        this.componentDidMount();
    }

    render() {
        const {classes} = this.props;
        return (
          <Fragment>
              <Layout>
                  <Helmet>
                      <title> Ma boutique de services sur My Alfred </title>
                      <meta property="description" content="Paramétrez les services que vous souhaitez proposer ! Vous pouvez en ajouter autant que vous le souhaitez : bricolage, jardinage, déménagement, décoration, évènementiel, quel sera votre prochain service ?" />
                  </Helmet>
                  <AlfredBanner shop={this.state.id}/>
                  <NavBarShop userId={this.state.userId}/>
                  <Grid className={classes.marginMainContainer}>
                      <Grid className={classes.aboutAndSkillsMainContainer}>
                          <Grid className={classes.aboutContentContainer}>
                              <About alfred={this.state.alfred} languages={this.state.languages} shop={this.state.shop}/>
                          </Grid>
                          <Grid className={classes.skillsContentContainer}>
                              <SkillsAlfred alfred={this.state.alfred}/>
                          </Grid>
                      </Grid>
                      <Grid className={classes.servicesContainer}>
                          <Grid className={classes.largeWidth}>
                              <Typography variant="h6">
                                  Les services de {this.state.alfred.firstname}
                              </Typography>
                          </Grid>
                          <Grid container className={classes.cardPreviewContainer} spacing={2}>
                              { Object.keys(this.state.services).map( result => {
                                  return (
                                    <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
                                        <CardPreview
                                          isOwner={this.state.isOwner}
                                          userState={this.state.userState}
                                          alfred={this.state.alfred}
                                          shop={this.state.shop}
                                          service={this.state.services[result].service}
                                          services={this.state.services[result]}
                                          needRefresh={this.needRefresh}/>
                                    </Grid>
                                  )
                              })
                              }
                              {this.state.userState && this.state.isOwner  ?
                                <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
                                    <CardAddService/>
                                </Grid>
                                : null
                              }

                          </Grid>
                      </Grid>
                      <Grid>
                          <AlfredConditions
                            isOwner={this.state.isOwner}
                            userState={this.state.userState}
                            alfred={this.state.alfred}
                            shop={this.state.shop}
                            needRefresh={this.needRefresh}
                          />
                          <hr className={classes.hrShop}/>
                          <AlfredConditionsBooking
                            isOwner={this.state.isOwner}
                            userState={this.state.userState}
                            alfred={this.state.alfred}
                            shop={this.state.shop}
                            newMessage={this.state.newWelcomedMessage}
                            needRefresh={this.needRefresh}
                            stateButton={this.getStatusEditButton}
                          />
                          { this.state.isOwner ?
                            <AlfredWelcomedMessage
                              shop={this.state.shop}
                              stateButton={this.state.stateEditButtonFromAlfredCondtion}
                              newWelcomedMessage={this.getNewWelcomedMessage}
                            /> : null
                          }
                          <hr className={classes.hrShop}/>
                          <AlfredConditionsCancel
                            isOwner={this.state.isOwner}
                            userState={this.state.userState}
                            alfred={this.state.alfred}
                            shop={this.state.shop}
                            needRefresh={this.needRefresh}

                          />
                      </Grid>
                      {/*
                        <Grid style={{marginLeft: '5%', marginRight: '5%', marginTop: '3%'}}>
                            <Grid>
                                <h3>Commentaires</h3>
                            </Grid>
                            <Grid>
                                <Grid style={{width : '100%'}}>
                                    <Commentary/>
                                </Grid>
                                <hr style={{marginTop: 30, marginBottom: 30}}/>
                                <Grid style={{width : '100%'}}>
                                    <Commentary/>
                                </Grid>
                                    <hr style={{marginTop: 30, marginBottom: 30}}/>
                                <Grid style={{width : '100%'}}>
                                    <Commentary/>
                                </Grid>
                            </Grid>
                            <Grid style={{marginTop:50, marginBottom: 50}}>
                                <Typography>
                                    <Link href="#" onClick={preventDefault}>
                                        Voir plus de commentaires
                                    </Link>
                                </Typography>
                            </Grid>
                        </Grid>*/}
                  </Grid>
              </Layout>
              <Footer/>
          </Fragment>
        )
    };
}

shop.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default  withStyles(styles, { withTheme: true })(shop);
