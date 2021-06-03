import IconButton from '@material-ui/core/IconButton'
import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Router from 'next/router'
import axios from 'axios'
import styles from './UserAvatarStyle'
const { isEditableUser, getLoggedUserId } = require('../../utils/context')
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera'
import Badge from '@material-ui/core/Badge'

class UserAvatar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
      currentUser: '',
      kyc: null,
      owner: false,
      userId: '',
      isAbout: false,
      isPageEditable: false,
    }
  }

  componentDidMount() {
    const userId = getLoggedUserId()
    const profileUrl = ['services', 'about', 'reviews', 'calendar', 'statistics']
    const currentUrl = Router.pathname

    if (userId) {
      this.setState({ currentUser: userId })
    }
    if(profileUrl.includes(currentUrl.substring(currentUrl.lastIndexOf('/') + 1))) {
      this.setState({ isAbout: true })
    }
    if(Router.pathname === '/account/myProfile' || Router.pathname === '/profile/about') {
      this.setState({ isPageEditable: true })
    }
  }

  selectPicture = e => {
    e.preventDefault()
    if (isEditableUser(this.props.user)) {
      this.fileInput.click()
    }
  };

  avatarWithPics = (user, classes) => {
    const{ isAbout, myProfile } = this.state
    const url = user.picture.match(/^https?:\/\//) ? user.picture : `/${ user.picture}`

    return (
      <Avatar alt="photo de profil" src={url} className={isAbout ? classes.avatarLetterProfil : myProfile ? classes.myProfile : classes.avatarLetter}/>
    )
  }

  avatarWithoutPics = (user, classes) => {
    const{ isAbout, myProfile } = this.state

    return (
      <Avatar alt="photo de profil" className={isAbout ? classes.avatarLetterProfil : myProfile ? classes.myProfile : classes.avatarLetter}>
        <p>{user.avatar_letters}</p>
      </Avatar>
    )
  }

  onChange = event => {
    const newPicture = event.target.files[ 0 ]
    const formData = new FormData()
    formData.append('myImage', newPicture)
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    }
    axios.post('/myAlfred/api/users/profile/picture', formData, config)
      .then(() => {
        this.props.fireRefresh()
      }).catch(err => {
        console.error(err)
      })

  }

  render() {
    const { user, classes } = this.props
    const { currentUser, isPageEditable } = this.state

    let owner = user ? currentUser === user._id : null

    return (
      <Grid style={{ width: '100%', height: '100%' }}>
        <Grid style={{
          height: '100%',
          width: '100%',
        }}>
          <Badge
            overlap="circle"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            classes={{ root: classes.badge }}
            badgeContent={ owner && isPageEditable ? <Grid>
              <input
                ref={fileInput => this.fileInput = fileInput}
                accept="image/*"
                className={classes.input}
                id="icon-button-file" type="file"
                onChange={this.onChange}
              />
              <label htmlFor="icon-button-file">
                <IconButton onClick={this.selectPicture} className={classes.buttonCamera} aria-label="upload picture" component="span">
                  <PhotoCameraIcon/>
                </IconButton>
              </label>
            </Grid> : null}
          >
            {
              user.picture ? this.avatarWithPics(user, classes) : this.avatarWithoutPics(user, classes)
            }
          </Badge>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(UserAvatar)
