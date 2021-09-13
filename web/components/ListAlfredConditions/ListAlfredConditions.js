import {withTranslation} from 'react-i18next'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import InfoWithPics from '../InfoWithPics/InfoWithPics'

class ListAlfredConditions extends React.Component {
  constructor(props) {
    super(props)

  }
  render() {
    const{columnsXl, columnsLG, columnsMD, columnsSm, columnsXS, wrapperComponentProps} = this.props
    return(
      <Grid container style={{padding: '1%', display: 'flex'}}>
        {
          wrapperComponentProps ?
            Object.keys(wrapperComponentProps).map((res, index) => (
              <Grid item xl={columnsXl} lg={columnsLG} md={columnsMD} sm={columnsSm} xs={columnsXS} key={index}>
                <InfoWithPics {...this.props} data={wrapperComponentProps[res]}/>
              </Grid>
            )) : null
        }
      </Grid>
    )
  }
}

export default withTranslation('custom', {withRef: true})(ListAlfredConditions)
