const {clearAuthenticationToken, setAxiosAuthentication}=require('../../../utils/authentication')
import React from 'react'
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import {Typography} from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import {withStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Layout from '../../../hoc/Layout/Layout'
import axios from 'axios'
import Router from 'next/router'


const styles = theme => ({
  loginContainer: {
    alignItems: 'center',
    height: '100vh',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  card: {
    padding: '1.5rem 3rem',
    width: 400,
  },
  cardContant: {
    flexDirection: 'column',
  },
  linkText: {
    textDecoration: 'none',
    color: 'black',
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: theme.palette.error.main,
    color: 'white',
  },
})

class view extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      tags: {},
      label: '',
      title: '',
      description: '',

    }

    this.handleClick = this.handleClick.bind(this)
  }

  static getInitialProps({query: {id}}) {
    return {tags_id: id}

  }

  componentDidMount() {
    localStorage.setItem('path', Router.pathname)
    const id = this.props.tags_id
    setAxiosAuthentication()
    axios.get(`/myAlfred/api/admin/tags/all/${id}`)
      .then(response => {
        let tags = response.data
        this.setState({tags: tags})

      })
      .catch(err => {
        console.error(err)
        if (err.response.status === 401 || err.response.status === 403) {
          clearAuthenticationToken()
          Router.push({pathname: '/login'})
        }
      })

  }

  onChange = e => {
    const state = this.state.tags
    state[e.target.name] = e.target.value
    this.setState({tags: state})
  };

  onSubmit = e => {
    e.preventDefault()

    const {label, title, description} = this.state.tags
    const id = this.props.tags_id
    axios.put(`/myAlfred/api/admin/tags/all/${id}`, {label, title, description})
      .then(res => {

        alert('Tag modifié avec succès')
        Router.push({pathname: '/dashboard/tags/all'})
      })
      .catch(err => {
        console.error(err)
      })


  };

  handleClick() {
    const id = this.props.tags_id
    axios.delete(`/myAlfred/api/admin/tags/all/${id}`)
      .then(res => {

        alert('Tag supprimé avec succès')
        Router.push({pathname: '/dashboard/tags/all'})
      })
      .catch(err => {
        console.error(err)
      })


  }


  render() {
    const {classes} = this.props
    const {tags} = this.state


    return (
      <Layout>
        <Grid container className={classes.loginContainer}>
          <Card className={classes.card}>
            <Grid>
              <Grid item style={{display: 'flex', justifyContent: 'center'}}>
                <Typography style={{fontSize: 30}}>{tags.label}</Typography>
              </Grid>
              <form onSubmit={this.onSubmit}>
                <Grid item>
                  <TextField
                    id="standard-with-placeholder"
                    margin="normal"
                    style={{width: '100%'}}
                    type="text"
                    name="label"
                    value={tags.label}
                    onChange={this.onChange}

                  />
                </Grid>
                <Grid item>
                  <TextField
                    id="standard-with-placeholder"
                    margin="normal"
                    style={{width: '100%'}}
                    type="text"
                    name="title"
                    value={tags.title}
                    onChange={this.onChange}

                  />
                </Grid>
                <Grid item>
                  <TextField
                    id="standard-with-placeholder"
                    margin="normal"
                    style={{width: '100%'}}
                    type="text"
                    multiline
                    rows={4}
                    name="description"
                    value={tags.description}
                    onChange={this.onChange}

                  />
                </Grid>
                <Grid item style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>
                  <Button type="submit" variant="contained" color="primary" style={{width: '100%'}}>
                    Modifier
                  </Button>
                  <Button type="button" variant="contained" classes={{root: classes.cancelButton}} style={{width: '100%'}}
                    onClick={this.handleClick}>
                    Supprimer
                  </Button>
                </Grid>
              </form>
            </Grid>
          </Card>
        </Grid>
      </Layout>
    )
  }
}


export default withStyles(styles)(view)
