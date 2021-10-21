import ReactHtmlParser from 'react-html-parser'
import {withTranslation} from 'react-i18next'
const {clearAuthenticationToken, setAxiosAuthentication} = require('../../utils/authentication')
import React from 'react'
import io from 'socket.io-client'
import axios from 'axios'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import moment from 'moment'
import {withStyles} from '@material-ui/core/styles'
import styles from '../../static/css/components/MessagesDetails/MessagesDetails'
import {MESSAGE_DETAIL} from '../../utils/i18n'
import Router from 'next/router'
const {hideIllegal} = require('../../utils/text')
import Divider from '@material-ui/core/Divider'

moment.locale('fr')

class MessagesDetails extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userData: {},
      message: '',
      messages: [],
      oldMessagesDisplay: [],
      oldMessages: [],
      roomData: {},
      emitter: '',
      chats: null,
    }
  }

  componentDidMount() {

    setAxiosAuthentication()
    localStorage.setItem('path', Router.pathname)

    axios.get(`/myAlfred/api/users/users/${this.props.relative._id}`)
      .then(res => {
        this.setState({relative: res.data})
      })

    this.setState({chats: this.props.chats})
    const messages=[]
    this.props.chats.forEach(c => {
      if (c.messages.length>0) {
        messages.push(...c.messages)
      }
    })
    messages.sort((m1, m2) => moment(m1.date)-moment(m2.date))
    this.setState({
      oldMessagesDisplay: messages,
      oldMessage: messages,
    })

    axios.get('/myAlfred/api/users/current')
      .then(res => {
        this.setState({userData: res.data, emitter: res.data._id, recipientpic: res.data.picture})
      })
      .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          clearAuthenticationToken()
          Router.push({pathname: '/'})
        }
      })

    const chatRoomId = this.props.chats.sort((c1, c2) => moment(c1.latest)-moment(c2.latest))[0]._id

    axios.put(`/myAlfred/api/chatRooms/viewMessages/${ chatRoomId}`)
      .then()
    axios
      .get(`/myAlfred/api/chatRooms/userChatRoom/${chatRoomId}`)
      .then(res => {
        this.setState({
          roomData: res.data,
        }, () => this.grantNotificationPermission())
        this.socket = io()
        this.socket.on('connect', () => {
          this.socket.emit('room', this.state.roomData.name)
        })
        this.socket.on('displayMessage', data => {
          const messages = [...this.state.messages]
          const oldMessages = [...this.state.oldMessages]
          oldMessages.push(data)
          messages.push(data)
          this.setState({
            messages,
            oldMessages,
          }, () => this.showNotification(data))
        })
      })
      .catch(err => console.error(err))

    const div = document.getElementById('chat')
    if (div) {
      setTimeout(() => {
        div.scrollTop = 999999
      }, 200)
    }

  }


  componentDidUpdate = (prevState, prevProps) => {
    if(prevState.messages !== this.state.messages) {
      this.props.sendOldMessages()
    }
  };


  getMessage = message => {
    this.setState({message: message})
  };

  handleSubmit = event => {
    if (this.state.message.length !== 0 && this.state.message.trim() !== '') {
      const messObj = {
        user: this.state.userData.firstname,
        idsender: this.state.userData._id,
        content: hideIllegal(this.state.message),
        date: Date.now(),
        thepicture: this.state.recipientpic,
      }
      const chatRoomId = this.props.chats.sort((c1, c2) => moment(c1.latest)-moment(c2.latest))[0]._id

      axios
        .put(
          `/myAlfred/api/chatRooms/addMessage/${chatRoomId}`,
          {
            message: messObj,
            booking_id: this.props.bookingId,
          },
        )
        .then()

      event.preventDefault()
      this.socket.emit('message', messObj)
      this.setState({message: ''})
      const div = document.getElementById('chat')
      if (div) {
        setTimeout(() => {
          div.scrollTop = 999999
        }, 200)
      }
    }
    else {
      event.preventDefault()
    }
  };

  showNotification = message => {

    const {userData} = this.state

    if (message.idsender !== userData._id) {
      const title = message.user
      const body = message.content

      new Notification(title, {body})
    }
  };

  grantNotificationPermission = () => {
    if (!('Notification' in window)) {
      alert(ReactHtmlParser(this.props.t('MESSAGE_DETAIL.browser_compatibility')))
    }

    if (
      Notification.permission !== 'denied' ||
      Notification.permission === 'default'
    ) {
      try {
        Notification.requestPermission().then(result => {
          if (result === 'granted') {
            new Notification(ReactHtmlParser(this.props.t('MESSAGE_DETAIL.notif')))
          }
        })
      }
      catch (err) {
        if (err instanceof TypeError) {
          Notification.requestPermission().then(result => {
            if (result === 'granted') {
              new Notification(ReactHtmlParser(this.props.t('MESSAGE_DETAIL.notif')))
            }
          })
        }
      }
    }
  };

  render() {
    const {classes} = this.props
    const {relative, emitter} = this.state

    if (!relative) {
      return null
    }

    return (
      <Grid style={{width: '100%'}}>
        <Grid style={{width: '100%'}}>
          <Grid>
            {this.state.oldMessagesDisplay.map((oldMessage, index) => {
              return (
                <Grid className={emitter === oldMessage.idsender ? classes.currentUserContainer : classes.senderUserContainer} key={index}>
                  <Grid className={emitter === oldMessage.idsender ? classes.currentUser : classes.senderUser}>
                    <Grid>
                      <Typography style={{wordWrap: 'break-word'}}>{`${oldMessage.content}`}</Typography>
                    </Grid>
                  </Grid>
                  <Grid>
                    <Typography className={emitter === oldMessage.idsender ? classes.current : classes.sender}>{moment(oldMessage.date).calendar()}</Typography>
                  </Grid>
                </Grid>
              )
            })}
            {typeof this.state.roomData.messages !== 'undefined' ? (
              <Grid style={{marginTop: '10vh'}}>
                <Grid>
                  <Divider/>
                </Grid>
                <Grid style={{display: 'flex', alignItems: 'center', flexDirection: 'column', marginTop: '3vh'}}>
                  <Typography>{ReactHtmlParser(this.props.t('MESSAGE_DETAIL.new_messages'))}</Typography>
                </Grid>
                {this.state.messages.map((message, index) => {
                  return (
                    <Grid className={emitter === message.idsender ? classes.currentUserContainer : classes.senderUserContainer} key={index}>
                      <Grid className={emitter === message.idsender ? `customcurrentusermessage ${classes.currentUser}` : `customusermessage ${classes.senderUser}`}>
                        <Grid>
                          <Typography style={{wordWrap: 'break-word'}}>{message.content}</Typography>
                        </Grid>
                      </Grid>
                      <Grid>
                        <Typography className={emitter === message.idsender ? classes.current : classes.sender}>{moment(message.date).calendar()}</Typography>
                      </Grid>
                    </Grid>
                  )
                })}
              </Grid>
            ) : null}

          </Grid>

        </Grid>
      </Grid>
    )
  }
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(MessagesDetails))
