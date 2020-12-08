const {setAxiosAuthentication}=require('../../utils/authentication')
import React from 'react';
import Grid from '@material-ui/core/Grid';
import axios from 'axios'
import {withStyles} from '@material-ui/core/styles';
import styles from './SkillsStyle';

const {SKILLS}=require('../../utils/consts');
import Topic from "../../hoc/Topic/Topic"

class Skills extends React.Component {
  constructor(props) {
    super(props);
    const skill_values =  Object.keys(SKILLS).reduce( (acc, curr) => ({...acc, [curr]:0}), {});
    this.state = {
      alfred: [],
      dense: false,
      secondary: false,
      valueRating: 3,
      isChecked: false,
      skill_values: skill_values,
    }
  }

  componentDidMount = () => {
    setAxiosAuthentication()

    if (this.props.alfred) {
      axios.get(`/myAlfred/api/reviews/${this.props.alfred}`)
        .then( res => {
          var skill_values = this.state.skill_values;
          const skills = res.data;
          Object.keys(skills).forEach( key => {
            if (Object.keys(SKILLS).includes(key)) {
              skill_values[key]+=skills[key]
            }
          });
          this.setState({ skill_values:skill_values})
        }).catch(err => console.error(err))
    }
    if (this.props.review) {
      axios.get(`/myAlfred/api/reviews/review/${this.props.review}`)
        .then( res => {
          var skill_values = this.state.skill_values;
          const skills = res.data.note_alfred;
          Object.keys(skills).forEach( key => {
            if (Object.keys(SKILLS).includes(key)) {
              skill_values[key]+=skills[key]
            }
          });
          this.setState({ skill_values:skill_values})
        }).catch(err => console.error(err))
    }
  };

  render() {
    const {classes, hideCount, onClick, skills} = this.props;
    const {skill_values}=this.state;

    const skillClicked = (e, name) => {
      e.stopPropagation();
      if (onClick) {
        onClick(name);
      }
    };


    return (
      <Topic titleTopic={'Compliments'}>
        <Grid container className={classes.skillsContainer} spacing={3}>
          { Object.keys(SKILLS).map(skill => {
            const name =  SKILLS[skill].entrieName;
            const count= skills ? skills[name] : skill_values[skill];
            const pic=`/static/assets/img/skillsAlfred/${SKILLS[skill].picture}${count?'':'_disabled'}.svg`;
              return (
                <Grid item xs={6} lg={3} xl={3} sm={6} md={6} className={classes.skillCard} onClick={(e) => skillClicked(e, name)}>
                  <Grid>
                    <img title={'pics'} alt={'pics'} src={pic} className={classes.avatarSize}/>
                  </Grid>
                  <Grid className={classes.skillTitle}>{SKILLS[skill].label}</Grid>
                  { hideCount ? null:
                    <Grid className={classes.skillValue}>{`(${skill_values[skill]})`}</Grid>
                  }
                </Grid>
              )
            })
          }
        </Grid>
      </Topic>
    );
  }
}

export default withStyles(styles)(Skills)
