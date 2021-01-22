import React from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {Button} from "@material-ui/core";
import axios from "axios";
import {computeAverageNotes} from '../../../utils/functions';
import Box from "@material-ui/core/Box";
import Rating from "@material-ui/lab/Rating";
const {computeDistanceKm} = require('../../../utils/functions');
import RoomIcon from '@material-ui/icons/Room';
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import styles from '../../../static/css/components/Card/CardService/CardService'
import {withStyles} from '@material-ui/core/styles'
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import IconButton from '@material-ui/core/IconButton';
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import Router from 'next/router';
const {isEditableUser}=require('../../../utils/functions');

class CardServiceInfo extends React.Component{
  constructor(props) {
    super(props);
  }
  render() {
    const{classes} = this.props;

    return (
      <Grid>
        <Paper elevation={1} className={classes.cardServiceInfoPaper}>
          <Grid className={classes.cardServiceInfoContent}>
            <Grid>
              <h2 className={classes.cardServiceInfoTitle}>Besoin d'aide ?</h2>
            </Grid>
            <Grid>
              <p className={classes.cardServiceInfoText}>Utilisez notre chat en direct !</p>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

    );
  }
}

class CardService extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      cpData: {},
      dense: true,
      score: null,
      service: null,
      shop: null,
      open: false,
      id_service: '',
      reviews: [],
      alfred: {}
    }
  }

  componentDidMount() {
    axios.get(`/myAlfred/api/serviceUser/cardPreview/${this.props.item}`)
      .then(res => {
        this.setState({cpData: res.data, alfred: res.data.alfred});
      })
      .catch(err => console.error(err));
  }

  handleClickOpen =(id) => {
    this.setState({id_service: id, open: true});
  };

  handleClose = () => {
    this.setState({id_service: '', open: false});
  };

  deleteService(id) {
    axios.delete('/myAlfred/api/serviceUser/' + id)
      .then(() => {
        this.setState({open: false, id_service: ''}, () => window.location.reload());
      })
      .catch(err => console.error(err));
  }

  modalDeleteServices = () => {
    return(
      <Dialog
        open={this.state.open}
        onClose={() => this.handleClose()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Supprimer un service'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Voulez-vous vraiment supprimer ce service de votre service ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.handleClose()} color="primary">
            Annuler
          </Button>
          <Button onClick={() => this.deleteService(this.state.id_service)} color="secondary" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      )
  };

  render() {
    const {classes, isOwner, gps,profileMode, user, address} = this.props;
    const {cpData, alfred, open} = this.state;

    let distance = gps ? computeDistanceKm(gps, cpData.gps) : null;
    distance = distance ? distance.toFixed(0) : '';

    const notes = cpData.reviews ? computeAverageNotes(cpData.reviews.map(r => r.note_alfred)) : {};

    var resa_link =  `/userServicePreview?id=${cpData._id}`
    if (address) {
      resa_link+=`&address=${address}`
    }
    if (this.props.item===null) {
      return (
        <Hidden only={['xs', 'sm']}>
          <CardServiceInfo classes={classes} />
        </Hidden>
      )
    }

    if (this.props.item===undefined) {
      return null
    }

    const picture = profileMode ? cpData.picture : alfred.picture || cpData.picture;

    const editable = isEditableUser(alfred);

    return(
      <Grid className={classes.mainCardServiceContainer}>
        <Paper elevation={1} className={profileMode ? classes.profileModecardServicePaper : classes.cardServicePaper}>
          <Grid className={profileMode ? classes.profileModeCardService : classes.cardServiceMainStyle} onClick={() => {profileMode && editable ? null : window.open(resa_link, '_blank')}}>
            <Grid className={profileMode ? classes.profileModecardServiceFlexContainer : classes.cardServiceFlexContainer}>
              <Grid className={profileMode ? classes.profileModecardServicePicsContainer :  classes.cardServicePicsContainer}>
                <Grid style={{backgroundImage: `url("/${picture}")`}} className={classes.cardServiceBackgroundPics}/>
              </Grid>
              {
                profileMode && editable ?
                  <Grid style={{position: 'absolute', top: '5px', right: '5px', display: 'flex'}}>
                    <Grid>
                      <IconButton aria-label="delete" style={{backgroundColor: 'rgba(0,0,0,0.7)'}} size={'small'} onClick={() => Router.push(`/myShop/services?id=${cpData._id}`)}>
                        <EditIcon style={{color: 'white'}} />
                      </IconButton>
                    </Grid>
                    <Grid style={{marginLeft: '10px'}}>
                      <IconButton aria-label="delete" size={'small'} style={{backgroundColor: 'rgba(0,0,0,0.7)'}} onClick={() => this.handleClickOpen(cpData._id)}>
                        <DeleteForeverIcon style={{color: 'white'}} />
                      </IconButton>
                    </Grid>
                  </Grid>
                  :
                  <Grid className={classes.cardServiceChipName}>
                    <Chip label={alfred.firstname} avatar={cpData.is_professional ? <Avatar src="/static/assets/icon/pro_icon.svg"/> : null} className={classes.cardServiceChip} />
                  </Grid>
              }
            </Grid>
            <Grid className={profileMode ? classes.profileModeDataContainer : classes.dataContainer}>
              <Grid className={classes.labelService}>
                <Typography className={classes.labelDataContainer}><strong>{cpData.label}</strong></Typography>
              </Grid>
              { profileMode ? null :
                <Grid className={classes.cardServicePlaceContainer}>
                  <Grid className={classes.cardServicePlaceLogo}>
                    <RoomIcon/>
                  </Grid>
                  <Grid className={classes.cardKmContainer}>
                    { distance ?
                      <Hidden only={['xs']}>
                        <Grid style={{whiteSpace: 'nowrap'}}>
                          <Typography>{`À ${" "} ${distance} ${" "}km `}</Typography>
                        </Grid>
                        <Grid>
                          <Typography>-</Typography>
                        </Grid>
                      </Hidden>
                      :
                      null
                    }
                    <Grid style={{overflow: 'hidden'}}>
                      <Typography className={classes.stylecardServiceDistance}>{cpData.city}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              }
              {
                profileMode ? null :
                  <Grid className={classes.containerDescription}>
                    <Typography className={classes.descriptionStyle}>{cpData.description ? cpData.description : 'Cet alfred est peut être trop timide pour parler de lui !'}</Typography>
                  </Grid>
              }

              <Grid className={classes.cardServiceScoreAndButtonContainer}>
                <Grid className={classes.cardServiceRatingContainer}>
                  <Box component="fieldset" mb={3} borderColor="transparent" classes={{root: classes.cardPreviewRatingBox}}>
                  { cpData.reviews && cpData.reviews.length>0 ?
                    <Rating
                      name="simple-controlled"
                      value={cpData.reviews && cpData.reviews.length>0 ? 1:0}
                      max={1}
                      readOnly
                    />
                    :
                    null
                  }
                    <Grid className={classes.cardServiceBoxRatingDisplay}>
                      <Grid className={classes.cardServiceRating}>
                        { notes.global && notes.global >0 ?
                        <Typography className={classes.cardServiceLabelService}>{notes.global ? notes.global.toFixed(2) : 0}</Typography>
                        :
                        null
                      }
                      </Grid>
                      <Grid>
                        { cpData.reviews && cpData.reviews.length >0 ?
                          <Typography className={classes.cardServiceLabelService}>({cpData.reviews ? cpData.reviews.length : 0})</Typography>
                          :
                          null
                        }
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        {open ? this.modalDeleteServices() : null}
      </Grid>
    );
  }
}

export default withStyles(styles)(CardService)
