import React from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {Button} from "@material-ui/core";
import axios from "axios";
import {toast} from "react-toastify";
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

  handleClickOpen(id) {
    this.setState({id_service: id, open: true});
  }

  handleClose() {
    this.setState({id_service: '', open: false});
  }

  deleteService(id) {
    axios.delete('/myAlfred/api/serviceUser/' + id)
      .then(() => {
        toast.error('Service supprimé');
        this.setState({open: false, id_service: ''});
        this.props.needRefresh();
      })
      .catch(err => console.error(err));
  }

  render() {
    const {classes, isOwner, gps,profileMode, user} = this.props;
    const {cpData, alfred} = this.state;

    let distance = gps ? computeDistanceKm(gps, cpData.gps) : null;
    distance = distance ? distance.toFixed(0) : '';

    const notes = cpData.reviews ? computeAverageNotes(cpData.reviews.map(r => r.note_alfred)) : {};

    const resa_link =  `/userServicePreview?id=${cpData._id}`;
    if (this.props.item===null) {
      return (
        <CardServiceInfo classes={classes} />
      )
    }

    if (this.props.item===undefined) {
      return null
    }

    return(
      <Grid style={{ width: '100%'}}>
        <Paper elevation={1} className={classes.cardServicePaper} onClick={() => window.open(resa_link, '_blank')}>
          <Grid className={classes.cardServiceMainStyle}>
            { profileMode ? null :
              <Grid className={classes.cardServiceFlexContainer}>
                <Grid className={classes.cardServicePicsContainer}>
                  <Grid style={{backgroundImage: 'url("/' + cpData.picture + '")'}} className={classes.cardServiceBackgroundPics}/>
                </Grid>
                <Grid className={classes.cardServiceChipName}>
                  <Chip label={alfred.firstname} avatar={cpData.is_professional ? <Avatar src="/static/assets/icon/pro_icon.svg"/> : null} className={classes.cardServiceChip} />
                </Grid>
              </Grid>
            }
            <Grid style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '3vh'}}>
              <Grid>
                <Typography>{cpData.label}</Typography>
              </Grid>
              { profileMode ? null :
                <Grid className={classes.cardServicePlaceContainer}>
                  <Grid className={classes.cardServicePlaceLogo}>
                    <RoomIcon/>
                  </Grid>
                  <Grid style={{whiteSpace: 'nowrap'}}>
                    <Typography>{`À ${" "} ${distance} ${" "}km -`}</Typography>
                  </Grid>
                  <Grid className={classes.stylecardServiceDistance}>
                    <Typography  className={classes.stylecardServiceDistance}>{cpData.city}</Typography>
                  </Grid>
                </Grid>
              }
              {
                /*TODO API POUR USER DESCRIPTION
              <Grid>
                <Grid>
                  <Typography>{user.description ? user.description : 'aucune descrption'}</Typography>
                </Grid>
              </Grid>*/
              }

              <Grid className={classes.cardServiceScoreAndButtonContainer}>
                <Grid className={classes.cardServiceRatingContainer}>
                  <Box component="fieldset" mb={3} borderColor="transparent" classes={{root: classes.cardPreviewRatingBox}}>
                    <Rating
                      name="simple-controlled"
                      value={cpData.reviews && cpData.reviews.length>0 ? 1:0}
                      max={1}
                      readOnly
                    />
                    <Grid className={classes.cardServiceBoxRatingDisplay}>
                      <Grid className={classes.cardServiceRating}>
                        <Typography className={classes.cardServiceLabelService}>{notes.global ? notes.global.toFixed(2) : 0}</Typography>
                      </Grid>
                      <Grid>
                        <Typography className={classes.cardServiceLabelService}>({cpData.reviews ? cpData.reviews.length : 0})</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
}

export default withStyles(styles)(CardService)
