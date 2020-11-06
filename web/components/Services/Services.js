import React from 'react'
import axios from 'axios'
import {withStyles} from '@material-ui/core/styles';
import styles from './ServicesStyle';
import cookie from 'react-cookies';
import withGrid from "../../hoc/Grid/GridCard"
import withSlide from "../../hoc/Slide/SlideShow"
import CardService from '../Card/CardService/CardService'
import Box from "../Box/Box";
import Grid from "@material-ui/core/Grid";
const {frenchFormat} = require('../../utils/text')
const {SlideGridDataModel} = require('../../utils/models/SlideGridDataModel')

const InnerServices=withGrid(CardService)

class Services extends React.Component {

  constructor(props) {
    super(props)
    this.state= {
      shop:null
    }
  }

  componentDidMount() {
    axios.get(`/myAlfred/api/shop/alfred/${this.props.user}`)
      .then(response => {
        let shop = response.data;
        this.setState({
          shop: shop,
        })
    })
  }

  render() {
    const {classes}=this.props;
    const {shop}=this.state;
    if (!shop) {
      return null
    }

    const model=new SlideGridDataModel(shop.services.map(s => s._id), 4, 2, false)

    return (
      <Box>
        <InnerServices model={model} style={classes} colSizeXl={4} colSizeLg={4} colSizeMd={4} page={0} profileMode={true}/>
      </Box>

    )
  }

}

export default Services;
