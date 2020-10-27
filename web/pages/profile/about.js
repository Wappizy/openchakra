import React from 'react'
import Grid from "@material-ui/core/Grid";
import ProfileLayout from '../../components/Profile/ProfileLayout'
import About from '../../components/About/About'
import Presentation from '../../components/Presentation/Presentation'
import Skills from '../../components/Skills/Skills'
import Badges from '../../components/Badges/Badges'
import Hashtags from '../../components/Hashtags/Hashtags'

class ProfileAbout extends React.Component {

  constructor(props) {
    super(props)
    this.state={
    }
  }

  static getInitialProps({query: {user}}) {
    return {user: user};
  }

  render() {
    const {user}=this.props

    return (
      <ProfileLayout user={user}>
        <Grid container>
          <Grid item xs={4}>
            <About user={user} />
          </Grid>
          <Grid item xs={8}>
            <Presentation user={user} />
          </Grid>
          <Grid item xs={6}>
            <Skills user={user} />
          </Grid>
          <Grid item xs={6}>
            <Badges user={user} />
          </Grid>
          <Grid item xs={12}>
            <Hashtags user={user} />
          </Grid>
        </Grid>
      </ProfileLayout>
    )
  }

}

export default ProfileAbout
