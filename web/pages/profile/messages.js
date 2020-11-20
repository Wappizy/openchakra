import React from 'react'
import Grid from "@material-ui/core/Grid";
import {withStyles} from '@material-ui/core/styles';
import styles from '../../static/css/pages/profile/messages/messages';
import Hidden from "@material-ui/core/Hidden";
import axios from "axios";
import Typography from '@material-ui/core/Typography';
import cookie from 'react-cookies'
const moment=require('moment');
import MessageSummary from '../../components/MessageSummary/MessageSummary'
import _ from 'lodash'
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import MessagesDetails from '../../components/MessagesDetails/MessagesDetails'
import LayoutMessages from "../../hoc/Layout/LayoutMessages";
import Divider from '@material-ui/core/Divider';
import LayoutMobileMessages from "../../hoc/Layout/LayoutMobileMessages";
import IconButton from "@material-ui/core/IconButton";
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import SendIcon from "@material-ui/icons/Send";
import DialogActions from "@material-ui/core/DialogActions";
import UserAvatar from "../../components/Avatar/UserAvatar";

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography {...other} className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" onClick={onClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

class Messages extends React.Component {

  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.messageDetailsRef = React.createRef();
    this.state={
      tabIndex:0,
      chats: [],
      visibleDetails: false,
      message: '',

    };
    setTimeout( () => this.setState({visibleDetails: true}), 1000)
  }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = cookie.load('token');
    axios.get('/myAlfred/api/chatRooms/userChatRooms')
      .then( res => {
        const chats=res.data.filter(c => c.latest && c.booking && c.booking.alfred && c.messages && c.messages.length>0)
        this.setState({chats: chats})
      })
  }

  static getInitialProps({query: {user}}) {
    return {user: user};
  }

  getChatsRelative = relativeId => {
    return this.state.chats.slice().filter( c=>
      (c.emitter._id===this.props.user && c.recipient._id===relativeId)
      ||
      (c.emitter._id===relativeId && c.recipient._id===this.props.user)
    )
  }

  getRelatives = () => {
    var {chats, tabIndex} = this.state;
    if (!chats || chats.length===0) {
      return []
    }
    // Tab index 0 : Alfred, 1 : client
    // Filter chats for Alfred or client
    chats=chats.slice();
    if (tabIndex===0) {
      chats=chats.filter(c => c.booking.alfred===this.props.user)
    }
    else {
      chats=chats.filter(c => c.booking.user===this.props.user)
    }

    chats = chats.sort( (c1, c2) => moment(c2.latest)-moment(c1.latest));
    const users=_.uniqBy(chats.map( c => c.emitter._id.toString()===this.props.user ? c.recipient : c.emitter), '_id');
    return users
  };

  openMessagesDetails = relative => {
    this.setState({ relativeDetails: relative})
  };

  handleChangeMessage = (event) =>{
    this.setState({message: event.target.value}, () => this.messageDetailsRef.current.getMessage(this.state.message))
  };

  handleSubmitMessage = (event) =>{
    this.setState({message: ''});
    this.messageDetailsRef.current.handleSubmit(event)
  };

  messageDetails = (classes) => {
    let childState = this.messageDetailsRef.current.state;
    console.log(childState)
    const filteredChats = this.getChatsRelative(this.state.relativeDetails._id);
    const dates = childState.messages.concat(childState.oldMessagesDisplay).map(m => moment(m.date));
    const lastMessageDate = Math.max(...dates);


    return (
      <Dialog
        style={{width: '100%'}}
        open={Boolean(this.state.relativeDetails)}
        onClose={() => this.setState({relativeDetails: null})}
        classes={{paper: classes.messagesDialog}}
      >
        <DialogTitle id="customized-dialog-title" onClose={() => this.setState({relativeDetails: false})}>
          <Grid style={{display: 'flex', flexDirection: 'column'}}>
            <Grid>
              <UserAvatar
                user={this.state.relativeDetails}
                className={classes.avatarLetter}
              />
            </Grid>
            <Grid style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
              <Grid>
                <Typography >{this.state.relative.firstname}</Typography>
              </Grid>
              <Grid>
                <Typography style={{textAlign: 'center', whiteSpace: 'nowrap'}}>{`Dernier message ${moment(lastMessageDate).calendar()}`}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <MessagesDetails
            chatroomId={'5f1827ec04711c1f1e3b82e7'}
            id={'5f1827ec04711c1f1e3b82e7'}
            booking={'5f1827ec04711c1f1e3b82e8'}
            relative={this.state.relativeDetails}
            chats={filteredChats}
            ref={this.messageDetailsRef}
          />
        </DialogContent>
        <DialogActions classes={{root: classes.dialogActionRoot}}>
          <Grid>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="standard-adornment">Saisissez votre message</InputLabel>
              <OutlinedInput
                id="standard-adornment-password"
                type={'text'}
                value={this.state.message}
                onChange={this.handleChangeMessage}
                label={'Saisissez votre message'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={this.handleSubmitMessage}
                      aria-label="toggle password visibility"
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Grid>
        </DialogActions>
      </Dialog>
    )
  };

  handleChange = () => {
    let childState = this.child.current.state;
    this.setState({tabIndex: childState.tabIndex})
  };

  content = (classes) => {
    const relatives = this.getRelatives();
    return(
      <Grid style={{width: '100%'}}>
        <Grid>
          <Grid>
            <h2>Mes messages</h2>
          </Grid>
          <Grid>
            <Typography>{`Vous avez ${relatives.length} conversations `}</Typography>
          </Grid>
        </Grid>
        <Grid>
          <Divider style={{marginTop: '3vh', marginBottom: '3vh'}}/>
        </Grid>
        {relatives.map( m => {
          return (
            <Grid>
              <Grid>
                <MessageSummary chats={this.getChatsRelative(m._id)} relative={m} cbDetails={this.openMessagesDetails}/>
              </Grid>
              <Grid>
                <Divider style={{marginTop: '3vh', marginBottom: '3vh'}}/>
              </Grid>
            </Grid>
          )
        })}
      </Grid>
    )
  };

  render() {
    const {classes, user}=this.props;
    const {relativeDetails}=this.state;

    return (
      <React.Fragment>
        <Hidden only={['xs']}>
          <LayoutMessages ref={this.child} user={user} handleChange={this.handleChange} {...this.state}>
            {this.content(classes)}
          </LayoutMessages>
        </Hidden>
        <Hidden only={['lg', 'xl',  'sm', 'md']}>
          <LayoutMobileMessages ref={this.child} user={user} handleChange={this.handleChange} {...this.state}>
            {this.content(classes)}
          </LayoutMobileMessages>
        </Hidden>
        {relativeDetails ? this.messageDetails(classes) : null}
      </React.Fragment>
    )
  }

}
export default withStyles(styles)(Messages)
