import React from 'react';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import styles from '../../static/css/components/MessageSummary/MessageSummary';
import UserAvatar from '../Avatar/UserAvatar'
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import axios from 'axios';
const {frenchFormat} = require('../../utils/text');
const moment=require('moment');
moment.locale('fr');

class MessageSummary extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getLastMessage = () => {
    var {chats, relative}=this.props;
    chats = chats.sort( (c1, c2) => c2.latest-c1.latest);
    return chats[0].messages.slice().reverse()[0]
  };

  deleteMessages = e => {
    e.stopPropagation();
    console.log(JSON.stringify(this.props.chats.map (c=>c._id )))
    this.props.chats.forEach( chat => {
      axios.delete(`/myAlfred/api/chatRooms/userChatRooms/${chat._id}`)
        .then( res => console.log(`Chat supprimé:${chat._id}`))
        .then( err => console.log(`Erreur chat supprimé:${chat._id}:${err}`))
    });
  };

  render() {
    const {relative, chats, classes}=this.props;

    const last = this.getLastMessage();
    return (
      <Grid container style={{ width:'100%', display:'flex', flexDirection:'row', cursor: 'pointer'}} onClick={() => this.props.cbDetails(relative)}>
        <Grid style={{width: '100%'}}>
          <Grid style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Typography>
              { last ? `Le ${moment(last.date).format('DD/MM')}` : null }
            </Typography>
          </Grid>
          <Grid style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Grid>
              <Grid>
                <UserAvatar user={relative} className={classes.cardPreviewLarge}/>
              </Grid>
            </Grid>
            <Grid style={{marginLeft: '3vh'}}>
              <Grid>
                <Typography><strong>{relative.firstname}</strong></Typography>
              </Grid>
              <Grid>
                <Typography style={{textOverflow: 'ellipsis'}}>{last ? last.content : 'Aucun message'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid style={{display: 'flex', justifyContent: 'flex-end'}}>
            <IconButton onClick={this.deleteMessages} aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(MessageSummary)
