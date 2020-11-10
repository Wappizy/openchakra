import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import axios from 'axios'
import {withStyles} from '@material-ui/core/styles';
import styles from './SkillsStyle';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import clsx from 'clsx';
import Badge from '@material-ui/core/Badge';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import cookie from 'react-cookies';
const {SKILLS}=require('../../utils/consts')
import Topic from "../../hoc/Topic/Topic"
import Box from '../Box/Box'

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
    axios.defaults.headers.common['Authorization'] = cookie.load('token');

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
        })
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
        })
    }
  };

  render() {
    const {classes, hideCount, onClick, needTitle, alfred, widthHr} = this.props;
    const {skill_values}=this.state

    return (
      <Topic titleTopic={'Compliments'}>
        <Grid className={classes.skillsContainer}>
          { Object.keys(SKILLS).map(skill => {
            const count=skill_values[skill];
              const pic=`/static/assets/img/skillsAlfred/${SKILLS[skill].picture}${count?'':'_disabled'}.svg`;
              return (
                //<div style={{ display:'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Grid className={classes.skillCard} >
                  <Grid>
                    <img src={pic} className={classes.avatarSize}/>
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

export default withStyles(styles, {withTheme: true})(Skills)
