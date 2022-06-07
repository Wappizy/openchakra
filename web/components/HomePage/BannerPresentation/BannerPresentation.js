import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import {withTranslation} from 'react-i18next'
import Grid from '@material-ui/core/Grid'
import {Link} from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import {makeStyles} from '@material-ui/core/styles'
import {BANNER_PRESENTATION, BANNER_B2B_PRESENTATION} from '../../../utils/i18n'
import CustomButton from '../../CustomButton/CustomButton'

const useStyles = makeStyles(theme => ({
  bannerPresentationMainStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerPresentationContainerDescription: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    [theme.breakpoints.down('lg')]: {
      width: '100%',
    },
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },
  },
  bannerPresentationTitle: {
    fontWeight: 700,
    letterSpacing: '-0.0415625em',
    lineHeight: 1.25,
    color: '#FFFFFF',
    display: 'inline-block',
    margin: 0,
    [theme.breakpoints.down('xs')]: {
      fontSize: '25px',
    },
  },
  subtitleSpan: {
    fontSize: '60px',
    fontWeight: 900,
    lineHeight: '1em',
    display: 'block',
    [theme.breakpoints.down('xs')]: {
      '& strong': {
        lineHeight: 1,
      },
    },
  },
  titleSpan: {
    fontSize: '20px',
    fontWeight: 400,
    letterSpacing: '6.5px',
    display: 'block',
    [theme.breakpoints.down('xs')]: {
      '& span': {
        lineHeight: 2,
      },
    },
  },
  bannerPresentationText: {
    color: theme.palette.white.main,
    fontSize: '1.2rem',
    fontWeight: 500,
  },
  containerLinkDiscrover: {
    display: 'flex',
    marginTop: 20,
    marginLeft: 100,
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      justifyContent: 'center',
    },
  },
  bannerPresentationButton: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.white.main,
    fontWeight: theme.typography.whiteButtonContained.fontWeight,
    fontFamily: theme.typography.whiteButtonContained.fontFamily,
    borderRadius: theme.border.whiteButton.borderRadius,
    textTransform: theme.typography.textTransform,
    padding: theme.padding.whiteButtonContained.padding,
    fontSize: theme.typography.whiteButtonContained.fontSize,
  },
  bannerPresentationButtonB2b: {
    borderRadius: theme.border.button.borderRadius,
    textTransform: theme.typography.textTransform,
    fontWeight: theme.typography.fontWeight,
    border: '3px solid rgba(255, 255, 255, 1)',
    color: theme.palette.white.main,
  },
  illuStyle: {
    width: '80%',
  },
  illuContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.only('md')]: {
      display: 'none',
    },
    [theme.breakpoints.only('sm')]: {
      display: 'none',
    },
    [theme.breakpoints.only('xs')]: {
      display: 'none',
    },
  },
}))

function BannerPresentation(props) {
  const classes = useStyles()
  const {t} = props
  const title = ReactHtmlParser(t('BANNER_PRESENTATION.title'))
  const subTitle = ReactHtmlParser(t('BANNER_PRESENTATION.subTitle'))
  const text = ReactHtmlParser(t('BANNER_PRESENTATION.text'))

  return (
    <Grid container spacing={2} style={{width: '100%', margin: 0}}>
      <Grid container spacing={2} style={{width: '100%', margin: 0}} item xs={12} lg={6}>
        <Grid item xs={12} className={'custombannerh1'}>
          <h2 className={classes.bannerPresentationTitle}>
            <span className={`custombannerh1 ${classes.titleSpan}`}>{title}</span>
          </h2>
        </Grid>
        <Grid item xs={12} className={'custombannerh2'}>
          <h2 className={classes.bannerPresentationTitle}>
            <span className={`custombannerh2 ${classes.subtitleSpan}`}>{subTitle}</span>
          </h2>
        </Grid>
        <Grid item xs={12} className={'custombannercontent'}>
          <Typography className={`custombannercontent ${classes.bannerPresentationText}`}>{text}</Typography>
        </Grid>
        <Grid item xs={12} className={classes.containerLinkDiscrover}>
          <Link href={'/search'}>
            <CustomButton
              variant={'outlined' }
              classes={{root: `custombannerbutton ${classes.bannerPresentationButtonB2b}`}}>
              {ReactHtmlParser(t('BANNER_PRESENTATION.button'))}
            </CustomButton>
          </Link>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withTranslation('custom', {withRef: true})(BannerPresentation)
