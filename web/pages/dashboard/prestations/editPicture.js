import {withTranslation} from 'react-i18next'
import React from 'react';
import Layout from '../../../hoc/Layout/Layout';
import EditPicture from '../../../components/Dashboard/EditPicture/EditPicture';

class editPicture extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: null,
      type: 'prestation',
    };
  }

  static getInitialProps({query: {id}}) {
    return {prestation_id: id};
  }

  render() {

    return (
      <Layout>
        <EditPicture type={this.state.type} id={this.props.prestation_id}/>
      </Layout>
    );
  };
}


export default withTranslation()(editPicture)
