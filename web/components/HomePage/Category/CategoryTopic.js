import CustomButton from '../../CustomButton/CustomButton'
import ReactHtmlParser from 'react-html-parser'
import {withTranslation} from 'react-i18next'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import Router from 'next/router'
import {CATEGORY} from '../../../utils/i18n'
import styles from '../../../static/css/components/CategoryTopic/CategoryTopic'
import CategoryCard from '../../Card/CategoryCard/CategoryCard'
import withStyles from '@material-ui/core/styles/withStyles'
import withSlide from '../../../hoc/Slide/SlideShow'
import withGrid from '../../../hoc/Grid/GridCard'
const {SlideGridDataModel}=require('../../../utils/models/SlideGridDataModel')

const CategorySlide=withSlide(withGrid(CategoryCard))
import '../../../static/assets/css/custom.css'

class CategoryTopic extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const {classes, categories, user} = this.props

    if (!categories) {
      return null
    }

    return(
      <Grid className={classes.categoryMainContainer}>
        <Grid className={classes.categoryContainer}>
          <Grid className={classes.categoryLeftContainer}>
            <Grid className={`customslidelogo ${classes.categoryImgContainer}`}>
              <div className={`customiconstarcat ${classes.iconStarCat}`}/>
            </Grid>
            <Grid className={classes.categoryTextContainer}>
              <Grid>
                <p className={`customslideh1 ${classes.categoryTitle}`}>{ReactHtmlParser(this.props.t('CATEGORY.title'))}</p>
              </Grid>
              <Grid>
                <p className={`customslidetext ${classes.categoryText}`}>{ReactHtmlParser(this.props.t('CATEGORY.text'))}</p>
              </Grid>
            </Grid>
          </Grid>
          <Grid className={classes.hiddenOnXs}>
            <CustomButton variant={'outlined'} className={'customcatbutton'} classes={{root: `${classes.categoryButton}`}} onClick={() => Router.push('/search')}>
              {ReactHtmlParser(this.props.t('CATEGORY.button'))}
            </CustomButton>
          </Grid>
        </Grid>
        <Grid container className={classes.categorySlideShowContainer} spacing={3}>
          <Grid className={classes.categorySlideContainer}>
            <CategorySlide model={new SlideGridDataModel(categories, 4, 2, true)} style={classes} user={user}/>
          </Grid>
          <Grid item container spacing={3} className={classes.hideOnBigScreen}>
            {
              categories.map((category, index) => (
                <Grid item key={index}>
                  <CategoryCard item={category}/>
                </Grid>
              ))
            }
          </Grid>
        </Grid>
        <Grid className={classes.buttonDiscoverMobile}>
          <CustomButton variant={'outlined'} className={'customcatbutton'} classes={{root: `customcatbutton ${classes.categoryButton}`}} onClick={() => Router.push('/search')}>
            {ReactHtmlParser(this.props.t('CATEGORY.button'))}
          </CustomButton>
        </Grid>
      </Grid>
    )
  }
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(CategoryTopic))
