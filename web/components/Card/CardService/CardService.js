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
      page: false,
      reviews: [],
      alfred: {}
    }
  }

  componentDidMount() {
    axios.get(`/myAlfred/api/serviceUser/cardPreview/${this.props.services}`)
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
    const {style, userState, isOwner, gps, needAvatar, isAdmin} = this.props;
    const {cpData, alfred} = this.state;

    let distance = gps ? computeDistanceKm(gps, cpData.gps) : null;
    distance = distance ? distance.toFixed(0) : '';

    const notes = cpData.reviews ? computeAverageNotes(cpData.reviews.map(r => r.note_alfred)) : {};

    return(
      <Grid>
        <Paper elevation={1} className={style.cardServicePaper}>
          <Grid className={style.cardServiceMainStyle}>
            <Grid className={style.cardServiceFlexContainer}>
              <Grid className={style.cardServicePicsContainer}>
                <Grid style={{backgroundImage: 'url("' + cpData.picture + '")'}} className={style.cardServiceBackgroundPics}/>
              </Grid>
              <Grid className={style.cardServiceChipName}>
                <Chip label={alfred.firstname} className={style.cardServiceChip} />
              </Grid>
            </Grid>
            <Grid>
              <Grid>
                <p>{cpData.label}</p>
              </Grid>
              <Grid className={style.cardServicePlaceContainer}>
                <Grid className={style.cardServicePlaceLogo}>
                  <RoomIcon/>
                </Grid>
                <Grid style={{whiteSpace: 'nowrap'}}>
                  <p>{`À ${" "} ${distance} ${" "}km -`}</p>
                </Grid>
                <Grid className={style.stylecardServiceDistance}>
                  <p  className={style.stylecardServiceDistance}>{cpData.city}</p>
                </Grid>
              </Grid>
              <Grid className={style.cardServiceScoreAndButtonContainer}>
                <Grid className={style.cardServiceRatingContainer}>
                  <Box component="fieldset" mb={3} borderColor="transparent" classes={{root: style.cardPreviewRatingBox}}>
                    <Rating
                      name="simple-controlled"
                      value={1}
                      max={1}
                      readOnly
                    />
                    <Grid className={style.cardServiceBoxRatingDisplay}>
                      <Grid className={style.cardServiceRating}>
                        <p className={style.cardServiceLabelService}>3.5</p>
                      </Grid>
                      <Grid>
                        <p className={style.cardServiceLabelService}>(60)</p>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                <Grid className={style.cardServiceButtonContainer}>
                  <Grid>
                    <a href={'/userServicePreview?id=' + cpData._id} target="_blank">
                      <Button variant={'contained'} className={style.cardServiceButton}>Voir</Button>
                    </a>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
}

export default CardService;
