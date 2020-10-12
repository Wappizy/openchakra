import React from 'react'
import withTopic from '../../hoc/Topic/Topic';
import Schedule from "../../components/Schedule/Schedule";
import Grid from "@material-ui/core/Grid";
import axios from "axios";
import styles from '../../static/css/userServicePreviewPage/userServicePreviewStyle';
import withStyles from "@material-ui/core/styles/withStyles";

const ScheduleTopic = withTopic(Schedule);

class testwithTopic extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      availabilities: []
    }
  }

    componentDidMount(){
      axios.get(`/myAlfred/api/availability/userAvailabilities/5e6a68ca49342b093b96bd15`)
        .then(res => {
          let availabilities = res.data;
          this.setState({availabilities: availabilities});
        })
        .catch(err => console.error(err));

  }
  render() {
    const{classes} = this.props;

    return(
      <Grid>
        <ScheduleTopic
          mytitle={'mytitle'}
          mySubtitle={'mysubtitle'}
          availabilities={this.state.availabilities}
          bookings={[]}
          services={[]}
          selectable={true}
          height={400}
          nbSchedule={1}
          handleSelection={this.scheduleDateChanged}
          singleSelection={true}
          mode={'week'}
          style={classes}
        />
      </Grid>
    );
  }

}

export default withStyles(styles) (testwithTopic)
