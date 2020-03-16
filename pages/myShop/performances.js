import React, {Fragment} from 'react';
import Link from 'next/link';
import Layout from '../../hoc/Layout/Layout';
import Grid from "@material-ui/core/Grid";
import { withStyles } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import Footer from '../../hoc/Layout/Footer/Footer';
import { MYSHOP_MESSAGE, MYSHOP_SUBTITLE, MYSHOP_TITLE } from '../../utils/messages.js';
import axios from 'axios';
import {Helmet} from 'react-helmet';
import NavBarShop from '../../components/NavBar/NavBarShop/NavBarShop';

const jwt = require('jsonwebtoken');

const {config} = require('../../config/config');
const url = config.apiUrl;

const styles = theme => ({
    bigContainer: {
        marginTop: 68,
        flexGrow: 1,
    },
    shopbar:{
        [theme.breakpoints.down('md')]: {
            display: 'none',
        }
    },
    bottombar:{
        visibility:'hidden',
        [theme.breakpoints.down('sm')]: {
            visibility:'visible',
            boxShadow: '2px -5px 14px -15px rgba(0,0,0,0.75)'
        }},
    topbar:{
        visibility:'visible',
        position: 'sticky',
        top: 65,
        zIndex:999,
        [theme.breakpoints.down('sm')]: {
            visibility:'hidden',
        }},
});

class Performances extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            alfred: false,
            userId: "",
            services: [],
            isOwner:false,
            id: props.aboutId,
        }
    }

    static getInitialProps ({ query: { id_alfred } }) {
        return { aboutId: id_alfred }
    }

    componentDidMount() {
        const token = localStorage.getItem('token');
        if (token) {
            this.setState({logged:true});
            const token2 = localStorage.getItem('token').split(' ')[1];
            const decode = jwt.decode(token2);
            this.setState({alfred: decode.is_alfred});

            axios.defaults.headers.common['Authorization'] = token;
            axios
              .get(url+'myAlfred/api/users/current')
              .then(res => {
                  let user = res.data;
                  this.setState({alfred:user.is_alfred, userId: user._id});
              })
              .catch(err => console.log(err))
        }

        axios.get(`${url}myAlfred/api/shop/alfred/${this.state.id}`)
          .then( response  =>  {
              let shop = response.data;
              console.log(shop, 'shop')
              this.setState({
                  services: shop.services,
                  idAlfred: shop.alfred._id,
              }, () => this.checkIfOwner());

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

    render() {
        const {classes} = this.props;
        let isOwner= this.state.idAlfred === this.state.userId;

        return (
            <Fragment>
                <Helmet>
                    <title> Performance - Mes revenus - My Alfred </title>
                    <meta property="description" content="Découvrez les revenus générés grâce aux services entre particuliers que vous proposez. Retrouvez l'ensemble des revenus par mois et par année, les revenus passés et les revenus à venir sur My Alfred" />
                  </Helmet>

                <Layout>
                    <Grid container className={classes.bigContainer}>
                        {isOwner ?
                          <NavBarShop userId={this.state.userId}/>
                          : null
                        }
                        <Grid container>
                            <Grid item md={5} xs={12} style={{textAlign:'center', padding: '4%'}}>
                                <h1>{MYSHOP_TITLE}</h1>
                                <p>
                                    {MYSHOP_SUBTITLE}
                                </p>
                                <p>
                                    {MYSHOP_MESSAGE}
                                </p>
                                <Button color={"primary"} style={{borderRadius:'30px'}} variant={"contained"}><a style={{textDecoration:'none',color:'white'}} href={this.state.alfred ? '/myShop/services' : '/creaShop/creaShop'}>
                                    {this.state.alfred ? 'Ma boutique' : 'Proposer mes services'}
                                </a></Button>
                            </Grid>
                            <Grid item md={7} xs={12} style={{backgroundImage:'url(../../static/background/pagesina.svg)',backgroundPosition: 'center',backgroundRepeat: 'no-repeat',backgroundSize: 'cover', width: '100%', height: '100vh'}}/>
                        </Grid>
                    </Grid>
                </Layout>
                <Grid container className={classes.bottombar} justify="center" style={{backgroundColor: 'white',bottom:0, position:'fixed', zIndex:'999'}}>

                    <Grid item xs={2} style={{textAlign:"center"}}>
                        <Link href={`/shop?id_alfred=${this.state.userId}`}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/shopping-bag.png'} alt={'sign'} width={25} style={{opacity:'0.5'}}/></p></a>
                        </Link>
                    </Grid>

                    <Grid item xs={2} style={{textAlign:"center"}}>
                        <Link href={'/myShop/messages'}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/speech-bubble.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}/></p>
                        </a></Link>
                    </Grid>

                    <Grid item xs={2} style={{textAlign:"center"}}>
                        <Link href={'/myShop/mesreservations'}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/event.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}/></p>
                        </a></Link>
                    </Grid>

                    <Grid item xs={2} style={{textAlign:"center",zIndex:999}}>
                        <Link href={'/myShop/myAvailabilities'}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/calendar.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}/></p>
                        </a></Link>
                    </Grid>

                    <Grid item xs={2} style={{textAlign:"center", borderBottom: '3px solid #4fbdd7'}}>
                        <Link href={'/myShop/performances'}><a style={{textDecoration:'none'}}>
                            <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/speedometer.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}/></p>
                        </a></Link>
                    </Grid>
                </Grid>
                {/* <Footer/>*/}

            </Fragment>
        );
    };
}

export default withStyles(styles)(Performances);



