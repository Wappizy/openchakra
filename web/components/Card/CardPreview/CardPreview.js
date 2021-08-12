import React from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Rating from '@material-ui/lab/Rating'
import Avatar from '@material-ui/core/Avatar'
import styles from '../../../static/css/components/Card/CardPreview/CardPreview'
import withStyles from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import '../../../static/assets/css/custom.css'

class CardPreview extends React.Component {

  constructor(props) {
    super(props)
  }

  openService = () => {
    const url=`/userServicePreview?id=${this.props.item._id}&address=main`
    window.open(url, '_blank')
  }

  render() {
    const {item, classes} = this.props

    if (!item) {
      return null
    }

    const city = item.user && item.user.billing_address && item.user.billing_address.city ? item.user.billing_address.city : ''

    return(
      <Grid style={{height: 200, display: 'flex', alignItems: 'center', flexDirection: 'column'}}
        onClick={this.openService}>
        <Grid className={'customcardpreviewavatar'} style={{height: '30%', position: 'relative'}}>
          <Grid style={{position: 'absolute', bottom: 0, left: '50%', transform: 'translate(-50%,50%)', zIndex: 1}}>
            <Grid className={classes.cardPreviewContainerAvatar}>
              <Avatar alt="Remy Sharp" src={item.user.picture} className={classes.cardPreviewLarge} />
            </Grid>
          </Grid>
        </Grid>
        <Grid style={{height: '70%'}}>
          <Grid className={`customcardpreviewbox ${classes.cardPreviewBoxContentContainer}`}>
            <Grid className={classes.cardPreviewBoxContentPosition}>
              <Grid className={classes.cardPreviewContentIdentity}>
                <Grid>
                  <Typography className={`customcardpreviewname ${classes.cardPreviewNameAlfred}`}>{item.user.firstname}</Typography>
                </Grid>
                <Grid>
                  <Typography className={`customcardpreviewlabel ${classes.cardPreviewLabelService}`}>{item.service.label}</Typography>
                </Grid>
              </Grid>
              <Grid className={classes.cardPreviewServiceContent}>
                <Grid style={{overflow: 'hidden', whiteSpace: 'nowrap'}}>
                  <Typography className={'customcardpreviewplace'} style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{city}</Typography>
                </Grid>
                <Grid>
                  <Box component="fieldset" mb={item.user.score} borderColor="transparent" classes={{root: classes.cardPreviewRatingBox}}>
                    <Rating
                      name="simple-controlled"
                      value={item.user.score}
                      max={1}
                      readOnly
                      className={'customcardpreviewstar'}
                    />
                    <Typography className={'customcardpreviewrating'}>({item.user.score})</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(CardPreview)
