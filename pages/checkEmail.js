import React from 'react';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Layout from '../hoc/Layout/Layout';
import Link from "next/link";

const styles = theme => ({
    signupContainer: {
        alignItems: 'center',
        height: '100vh',
        justifyContent: 'top',
        flexDirection: 'column',

    },
    card: {
        fontFamily: 'Helvetica',
        width: 600,
        marginTop: '100px',
        [theme.breakpoints.down('xs')]:{
            width:'90%'
        }
    },
    banner: {
        marginBottom: 25,
        backgroundColor: '#2FBCD3',
        height: 80,
    },
    newContainer: {
        padding: 20,
    },
    title: {
        fontFamily: 'Helvetica',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        marginTop: 0,
        paddingTop: 22,
        letterSpacing: 1,
    },
    responsiveButton:{
        display:'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        [theme.breakpoints.down('xs')]:{
            flexDirection: 'column',
            justifyContent: 'center',
        }
    },
    responsiveSecondaryButton:{
        [theme.breakpoints.down('xs')]:{
           marginTop: '2%'
        }
    }
});

class checkEmail extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { classes } = this.props;

        return (
            <Layout>
                <Grid container className={classes.signupContainer}>
                    <Card className={classes.card}>
                        <div className={classes.banner}>
                            <h2 className={classes.title}>Inscription terminée</h2>
                        </div>
                        <div className={classes.newContainer}>
                            <Grid container style={{display: 'flex', justifyContent: 'center', marginTop: 20}}>
                                <img src='../static/happy_castor.svg' style={{width: 100}} alt={'success'}/>
                            </Grid>
                            <Grid item style={{display: 'flex', justifyContent: 'center', marginTop: 10, textAlign: 'justify'}}>
                                <p>Inscription réussie ! Vous pouvez maintenant proposer ou rechercher vos services sur My Alfred</p>
                            </Grid>
                            <Grid item className={classes.responsiveButton}>
                                <Grid item style={{marginRight:'1%' }}>
                                    <Link href={'/#register_done'}>
                                        <a style={{textDecoration:'none'}}>
                                            <Button variant={"contained"} color={"primary"} style={{color:"white"}}>Commencez à explorer</Button>
                                        </a>
                                    </Link>
                                </Grid>
                                <Grid item className={classes.responsiveSecondaryButton}>
                                    <Link href={'/becomeAlfredForm'}>
                                        <a style={{textDecoration:'none'}}>
                                            <Button variant={"contained"} color={"secondary"} style={{color:"white"}}>Créer ma boutique</Button>
                                        </a>
                                    </Link>
                                </Grid>
                            </Grid>
                        </div>
                    </Card>
                </Grid>
            </Layout>
        );
    };
}

export default withStyles(styles)(checkEmail);
