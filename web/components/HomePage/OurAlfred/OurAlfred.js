import ReactHtmlParser from 'react-html-parser'
import {withTranslation} from 'react-i18next'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import Router from 'next/router'
import Button from '@material-ui/core/Button'
import {CATEGORY, OUR_ALFRED} from '../../../utils/i18n'
import withStyles from '@material-ui/core/styles/withStyles'
import styles from '../../../static/css/components/OurAlfred/OurAlfred'
import withSlide from '../../../hoc/Slide/SlideShow'
import withGrid from '../../../hoc/Grid/GridCard'
import CardPreview from '../../Card/CardPreview/CardPreview'
import Typography from '@material-ui/core/Typography'
const {SlideGridDataModel}=require('../../../utils/models/SlideGridDataModel')

const AlfredSlide=withSlide(withGrid(CardPreview))

class OurAlfred extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const{classes, alfred} = this.props


    return(
      <Grid className={classes.ourAlfredMainStyle}>
        <Grid className={classes.ourAlfredMainContainer}>
          <Grid className={classes.ourAlfredMainHeader}>
            <Grid className={`customouralfredicon ${classes.ourAlfredImgContainer}`}>
              <img src={'/static/assets/faq/star.svg'} alt={'iconStar'} title={'iconStar'}/>
            </Grid>
            <Grid className={classes.ourAlfredTextContainer}>
              <Grid>
                <Typography className={`custumouralfredh1 ${classes.ourAlfredTitle}`}>{ReactHtmlParser(this.props.t('OUR_ALFRED.title'))}</Typography>
              </Grid>
              <Grid>
                <Typography className={`customouralfredtext ${classes.ourAlfredSubtitle}`}>{ReactHtmlParser(this.props.t('OUR_ALFRED.text'))}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid className={classes.hiddenOnMobile}>
            <Button classes={{root: `customouralfredbutton ${classes.ourAlfredButton}`}} onClick={() => Router.push('/search')}>{ReactHtmlParser(this.props.t('CATEGORY.button'))}</Button>
          </Grid>
        </Grid>
        <Grid container className={classes.categorySlideShowContainer} spacing={3}>
          <Grid item className={classes.alfredSlideContainer}>
            <AlfredSlide model={new SlideGridDataModel(alfred, 3, 1, true)} style={classes} />
          </Grid>
          <Grid item container spacing={3} className={classes.containerCardPreviewMobile}>
            {
              Object.keys(alfred).map((res, index) => (
                <Grid item key={index}>
                  <CardPreview item={alfred[res]}/>
                </Grid>
              ))
            }
          </Grid>
        </Grid>
        <Grid className={classes.containerMobileButton}>
          <Button variant={'outlined'} className={'customouralfredbutton'} classes={{root: `customouralfredbutton ${classes.categoryButton}`}} onClick={() => Router.push('/search')}>
            {ReactHtmlParser(this.props.t('CATEGORY.button'))}
          </Button>
        </Grid>
      </Grid>

    )
  }
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(OurAlfred))
