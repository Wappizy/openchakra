import {withTranslation} from 'react-i18next'
import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import styles from '../../static/css/components/Layout/LayoutMobileSearch/LayoutMobileSearch'
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Router from "next/router";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import MobileNavbar from "./NavBar/MobileNavbar";
import NavBar from "./NavBar/NavBar";

class LayoutMobileSearch extends React.Component{
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state={
      myProfilUrl: false,
      hideMobileNavbar: false
    }
  }

  callFilter = data =>{
    this.props.filter(data)
  };

  callFilterNavBar = () => {
    this.child.current.handleModalSearchBarInput();
  };

  render() {
    const{children, currentIndex} = this.props;

    return(
      <Grid>
        <Grid>
          <NavBar filter={this.callFilter} ref={this.child}/>
        </Grid>
        <Grid>
          {children}
        </Grid>
          <Grid style={{position: 'fixed', bottom: '3%', display: 'flex', justifyContent: 'center', width: '100%', zIndex: 1}}>
            <Grid style={{width: '100%'}}>
              <MobileNavbar currentIndex={currentIndex} filter={this.callFilterNavBar}/>
            </Grid>
          </Grid>
      </Grid>
    );
  }
}

export default withTranslation()(withStyles(styles)(LayoutMobileSearch))
