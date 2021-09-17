import ReactHtmlParser from 'react-html-parser'
import {withTranslation} from 'react-i18next'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '../../Box/Box'
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined'
import IconButton from '@material-ui/core/IconButton'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import Button from '@material-ui/core/Button'
import withStyles from '@material-ui/core/styles/withStyles'
import styles from '../../../static/css/components/Dashboard/Team/Team'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Typography from '@material-ui/core/Typography'
import InputLabel from '@material-ui/core/InputLabel'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Dialog from '@material-ui/core/Dialog'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DeleteIcon from '@material-ui/icons/Delete'
import Chip from '@material-ui/core/Chip'
import CloseIcon from '@material-ui/icons/Close'
import SettingsIcon from '@material-ui/icons/Settings'
import axios from 'axios'
const {setAxiosAuthentication}=require('../../../utils/authentication')
import InputAdornment from '@material-ui/core/InputAdornment'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import {MICROSERVICE_MODE} from '../../../utils/consts'
const {snackBarSuccess, snackBarError} = require('../../../utils/notifications')
const {ADMIN, BUDGET_PERIOD, MANAGER, EMPLOYEE} = require('../../../utils/consts')
import EmployeeImportDialog from '../../Employee/EmployeeImportDialog'


const DialogTitle = withStyles(styles)(props => {
  const {children, classes, onClose, onClick, ...other} = props
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Grid style={{display: 'flex', alignItems: 'center'}}>
        <Grid>
          <Typography variant="h6">{children}</Typography>
        </Grid>
        {
          onClick ? (
            <Grid>
              <IconButton aria-label="AddCircleOutlineOutlinedIcon" onClick={onClick}>
                <AddCircleOutlineOutlinedIcon/>
              </IconButton>
            </Grid>
          ) : null
        }
      </Grid>
      {onClose ? (
        <IconButton aria-label="closeButton" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  )
})

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

const FILTER_ALPHA= 'Ordre alphabétique'

class Team extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      managers_sort: FILTER_ALPHA,
      newAdmins: [{
        nameAdmin: '',
        firstNameAdmin: '',
        emailAdmin: '',
      }],
      admins: [],
      dialogGroupe: false,
      firstname: '',
      name: '',
      email: '',
      paymentMethod: [],
      dialogAdd: false,
      dialogRemove: false,
      selected: '',
      plafondGroupe: 0,
      nameGroupe: '',
      budget_period: null,
      canUpgrade: [],
      groups: [],
      // managers : MANAGER in MICROSERVICE_MODE, employees in CARETAKER_MODE
      managers: [],
      groupName: '',
      modeDialog: '',
      selectedGroup: '',
      newManagers: [{
        nameManager: '',
        firstNameManager: '',
        emailManager: '',
        groupSelected: '',
      }],
      accounts: [],
      cards: [],
      consumed_budgets: {},
      dialogEmployeeImport: false,
    }
  }

  componentDidMount() {
    const {mode}=this.props
    setAxiosAuthentication()
    axios.get('/myAlfred/api/companies/members').then(res => {
      let data = res.data
      const admins = data.filter(e => e.roles.includes(ADMIN))
      const managers = data.filter(e => e.roles.includes(mode==MICROSERVICE_MODE ? MANAGER : EMPLOYEE))
      this.setState({user: data, admins: admins, managers: managers})
    }).catch(err => {
      console.error(err)
    })

    axios.get(`/myAlfred/api/groups/type/${this.props.mode}`)
      .then(res => {
        let groups = res.data
        this.setState({groups: groups})
        groups.forEach(group => {
          axios.get(`/myAlfred/api/groups/${group._id}/budget`)
            .then(res => {
              let budgets = this.state.consumed_budgets
              budgets[group._id]=res.data
              this.setState({consumed_budgets: budgets})
            }).catch(err => { console.error(err) })
        })
      }).catch(err => {
        console.error(err)
      })

    axios.get('/myAlfred/api/payment/activeAccount')
      .then(response => {
        let accounts = response.data
        if (accounts.length) {
          this.setState({accounts: accounts})
        }
      }).catch(err => { console.error(err) })
    axios.get('/myAlfred/api/payment/cards')
      .then(response => {
        let cards = response.data
        if (cards.length) {
          this.setState({cards: cards})
        }
      }).catch(err => { console.error(err) })
  }

  handleChange = (event, index, user) => {
    const {value, name} = event.target
    if(['nameAdmin', 'firstNameAdmin', 'emailAdmin'].includes(name)) {
      const admins=this.state.newAdmins
      admins[index][name]=value
      this.setState({newAdmins: admins})
    }
    else if(['nameManager', 'firstNameManager', 'emailManager', 'groupSelected'].includes(name)) {
      const managers=this.state.newManagers
      managers[index][name]=value
      this.setState({newManagers: managers})
    }
    else if(name === 'groupName') {
      const data ={
        member_id: user._id,
      }
      axios.put(`/myAlfred/api/groups/${value}/managers`, data).then(() => {
        snackBarSuccess(ReactHtmlParser(this.props.t('TEAM.snackbar_add_member')))
        this.componentDidMount()
      }).catch(err => {
        snackBarError(err.response.error)
      })
    }
    else {
      this.setState({[name]: value})
    }
  };

  getStyles = (name, personName) => {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? 'regular'
          : 'bold',
    }
  };

  addNewLine = name => {
    if(name === 'nbAdmin') {
      let admins=this.state.newAdmins
      admins.push({nameAdmin: '', firstNameAdmin: '', emailAdmin: ''})
      this.setState({newAdmins: admins})
    }
    if(name === 'nbManager') {
      let managers=this.state.managers
      managers.push({nameManager: '', firstNameManager: '', emailManager: '', groupSelected: ''})
      this.setState({newManagers: managers})
    }
  };

  removeLine = (name, index) => {
    if(name === 'nbAdmin') {
      let admins = [...this.state.newAdmins]
      admins.splice(index, 1)
      this.setState({newAdmins: admins})
    }
    if(name === 'nbManager') {
      let managers = [...this.state.newManagers]
      managers.splice(index, 1)
      this.setState({newManagers: managers})
    }
  };

  handleClickOpen = (name, user, mode, groupeId) => {
    this.setState({selected: user || ''})
    this.setState({groupeIdSelected: groupeId || ''})
    this.setState({modeDialog: mode === 'manager' ? mode : 'admin'})

    if(name === 'dialogGroupe' && user) {
      this.setState({selected: user, nameGroupe: user.name, plafondGroupe: user.budget, budget_period: user.budget_period, paymentMethod: user.cards})
    }
    else{
      this.setState({nameGroupe: '', plafondGroupe: '', budget_period: ''})
    }

    this.setState({[name]: true})
  };

  addAdmin = () => {
    const{newAdmins, canUpgrade} = this.state
    setAxiosAuthentication()

    if(canUpgrade.length > 0) {
      canUpgrade.forEach(res => {
        axios.put('/myAlfred/api/companies/admin', {admin_id: res})
          .then(() => {
            this.setState({dialogAdd: false}, () => this.componentDidMount())
          })
          .catch(err => {
            snackBarError(err.response.data.error)
          })
      })
    }

    newAdmins.map(res => {
      if(res && res.firstNameAdmin !== '' && res.nameAdmin !== '' && res.emailAdmin !== '') {
        const data = {
          firstname: res.firstNameAdmin,
          name: res.nameAdmin,
          email: res.emailAdmin,
        }

        axios.post('/myAlfred/api/companies/members', data)
          .then(response => {
            let data = response.data
            const data_id ={
              admin_id: data._id,
              new_account: true,
            }
            axios.put('/myAlfred/api/companies/admin', data_id)
              .then(() => {
                this.setState({dialogAdd: false, newAdmins: [{nameAdmin: '', firstNameAdmin: '', emailAdmin: ''}]}, () => this.componentDidMount())
              })
              .catch(err => {
                snackBarError(err.response.data.error)
              })
          })
          .catch(err => {
            console.error(err)
            snackBarError(err.response.data.error)
          })
      }
    })
  };

  addManager = () => {
    const{canUpgrade, selectedGroup, newManagers} = this.state
    setAxiosAuthentication()
    if(canUpgrade.length > 0) {
      canUpgrade.map(res => {
        axios.put(`/myAlfred/api/groups/${selectedGroup}/managers`, {member_id: res._id})
          .then(() => {
            this.setState({dialogAdd: false}, () => this.componentDidMount())
          })
          .catch(err => {
            snackBarError(err.response.data.error)
          })
      })
    }

    newManagers.map(res => {
      if(res && res.firstNameManager !== '' && res.nameManager !== '' && res.emailManager !== '' && res.groupSelected !== '') {
        const data = {
          firstname: res.firstNameManager,
          name: res.nameManager,
          email: res.emailManager,
        }

        axios.post('/myAlfred/api/companies/members', data)
          .then(response => {
            let data = response.data
            const member_id ={
              member_id: data._id,
              new_account: true,
            }
            axios.put(`/myAlfred/api/groups/${res.groupSelected}/managers`, member_id).then(() => {
              this.setState({dialogAdd: false, newManagers: [{nameManager: '', firstNameManager: '', emailManager: '', groupSelected: ''}]}, () => this.componentDidMount())
            }).catch(err => snackBarError(err.response.data.error))
          })
          .catch(err => {
            console.error(err)
            snackBarError(err.response.data.error)
          })
      }
    })
  };

  addEmploye = () => {
    const{newManagers} = this.state

    setAxiosAuthentication()

    newManagers.map(res => {
      if(res && res.firstNameManager !== '' && res.nameManager !== '' && res.emailManager !== '' && res.groupSelected !== '') {
        const data = {
          firstname: res.firstNameManager,
          name: res.nameManager,
          email: res.emailManager,
        }

        axios.post('/myAlfred/api/companies/members', data)
          .then(response => {
            const user=response.data
            axios.put(`/myAlfred/api/groups/${res.groupSelected}/members`, {member_id: user._id})
              .then(() => {
                this.setState({dialogAdd: false, newManagers: [{nameManager: '', firstNameManager: '', emailManager: '', groupSelected: ''}]}, () => this.componentDidMount())
              })
              .catch(err => {
                console.error(err)
                snackBarError(err.response.data.error)
              })
          })
          .catch(err => {
            console.error(err)
            snackBarError(err.response.data.error)
          })
      }
    })
  }

  removeAdmin = () => {
    const{selected} = this.state
    setAxiosAuthentication()

    axios.delete(`/myAlfred/api/companies/admin/${selected._id}`)
      .then(() => {
        snackBarSuccess(ReactHtmlParser(this.props.t('TEAM.snackbar_remove_admin', {firstname: selected.name})))
        this.setState({dialogRemove: false}, () => this.componentDidMount())
      })
      .catch(err => {
        snackBarError(err.response.data.error)
      })
  };

  removeManager = () => {
    const{selected, groupeIdSelected} = this.state
    setAxiosAuthentication()
    axios.delete(`/myAlfred/api/groups/${groupeIdSelected}/managers/${selected._id}`)
      .then(() => {
        snackBarSuccess(ReactHtmlParser(this.props.t('TEAM.snackbar_remove_manager')))
        this.setState({dialogRemove: false}, () => this.componentDidMount())
      })
      .catch(err => {
        console.error(err)
      })
  };

  addGroupe = () => {
    const{plafondGroupe, nameGroupe, budget_period, paymentMethod} = this.state
    const{mode} = this.props

    const data = {
      name: nameGroupe,
      budget: plafondGroupe,
      budget_period: budget_period === ''? null : budget_period,
      cards: paymentMethod,
      type: mode,
    }

    axios.post('/myAlfred/api/groups', data)
      .then(() => {
        snackBarSuccess(ReactHtmlParser(this.props.t('TEAM.snackbar_create_groupe')) + nameGroupe + ReactHtmlParser(this.props.t('TEAM.snackbar_create_name_groupe')))
        this.setState({dialogGroupe: false}, () => this.componentDidMount())
      })
      .catch(err => {
        snackBarError(err.response.data.error)
      })
  };

  updateGroupe = () => {
    const{selected, plafondGroupe, nameGroupe, budget_period, paymentMethod} = this.state

    const data = {
      name: nameGroupe,
      budget: plafondGroupe,
      budget_period: budget_period,
      cards: paymentMethod,
    }

    axios.put(`/myAlfred/api/groups/${selected._id}`, data)
      .then(() => {
        snackBarSuccess(selected.name + ReactHtmlParser(this.props.t('TEAM.snackbar_update_groupe')))
        this.setState({dialogGroupe: false}, () => this.componentDidMount())
      })
      .catch(err => {
        snackBarError(err.response.data.error)
      })
  };

  removeGroupe = () => {
    const{selected} = this.state
    axios.delete(`/myAlfred/api/groups/${selected._id}`)
      .then(() => {
        snackBarSuccess(ReactHtmlParser(this.props.t('TEAM.snackbar_create_groupe')) + selected.name + ReactHtmlParser(this.props.t('TEAM.snackbar_delete')))
        this.setState({dialogRemoveGroupe: false}, () => this.componentDidMount())
      })
      .catch(err => {
        snackBarError(err.response.data.error)
      })
  };

  dialogAdd = classes => {
    const{dialogAdd, newAdmins, user, canUpgrade, modeDialog, groups, selectedGroup, newManagers} = this.state
    const {mode} = this.props

    let userEmploye = modeDialog === 'admin' ? user ? user.filter(e => !e.roles.includes(ADMIN)) : '' : user ? user.filter(e => !e.roles.includes(MANAGER)) : ''

    let objectToMap = modeDialog === 'admin' ? newAdmins : newManagers


    return(
      <Dialog open={dialogAdd} onClose={() => this.setState({dialogAdd: false})} aria-labelledby="form-dialog-title" classes={{paper: classes.dialogPaper}}>
        <DialogTitle id="customized-dialog-title" onClose={() => this.setState({dialogAdd: false})}>
          {ReactHtmlParser(this.props.t(mode === MICROSERVICE_MODE ? 'TEAM.dialog_add_manager' : 'TEAM.dialog_add_employe'))}
        </DialogTitle>
        <DialogContent dividers>
          {mode === MICROSERVICE_MODE ?
            userEmploye.length === 0 ? null :
              <Grid style={{paddingBottom: 20}}>
                <Grid container spacing={2} style={{width: '100%', margin: 0, paddingBottom: 40}}>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <h3>{ReactHtmlParser(this.props.t('TEAM.existing_account'))}</h3>
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <FormControl variant="outlined" className={classes.formControl} style={{width: '100%'}}>
                      <InputLabel id="demo-mutiple-chip-label">{ReactHtmlParser(this.props.t('TEAM.user_title'))}</InputLabel>
                      <Select
                        labelId="demo-mutiple-chip-label"
                        id="demo-mutiple-chip"
                        multiple
                        onChange={e => this.handleChange(e)}
                        name={'canUpgrade'}
                        value={canUpgrade}
                        input={<OutlinedInput label={ReactHtmlParser(this.props.t('TEAM.rib'))} id="select-multiple-chip" />}
                        renderValue={selected => (
                          <div className={classes.chips}>
                            {selected.map(user => (
                              <Chip key={user._id} label={user.email} className={classes.chip} />
                            ))}
                          </div>
                        )}
                        MenuProps={MenuProps}
                      >
                        {!userEmploye ? null :
                          userEmploye.map(user => (
                            <MenuItem key={user._id} value={user} style={this.getStyles(user.email, canUpgrade)}>
                              {user.email}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  { canUpgrade.length > 0 ?
                    <>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <h3>{ReactHtmlParser(this.props.t('TEAM.choose_department'))}</h3>
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <FormControl variant="outlined" className={classes.formControl} style={{width: '100%'}}>
                          <InputLabel id="demo-simple-select-outlined-label">{ReactHtmlParser(this.props.t('TEAM.departement'))}</InputLabel>
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            name={'selectedGroup'}
                            onChange={this.handleChange}
                            label={ReactHtmlParser(this.props.t('TEAM.departement'))}
                            value={selectedGroup}
                          >
                            {
                              groups.map((res, index) => (
                                <MenuItem key={index} value={res._id}>{res.name}</MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </Grid>
                    </> : null
                  }
                </Grid>
                <Divider/>
              </Grid>: null
          }
          <Grid container spacing={2} style={{width: '100%', margin: 0}}>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Grid style={{display: 'flex', alignItems: 'center'}}>
                <Grid>
                  <h3>{ReactHtmlParser(this.props.t('TEAM.create_new_account'))}</h3>
                </Grid>
                <Grid>
                  <IconButton onClick={() => this.addNewLine(modeDialog === 'admin' ? 'nbAdmin' : 'nbManager')}>
                    <AddCircleOutlineOutlinedIcon/>
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {
            objectToMap.map((res, index) => (
              <Grid key={index}>
                <Grid container spacing={2} style={{width: '100%', margin: 0}}>
                  <Grid item xl={11} lg={11} sm={11} md={11} xs={11} container spacing={2} style={{width: '100%', margin: 0}}>
                    <Grid item xl={6} lg={6} sm={6} md={6} xs={6}>
                      <TextField
                        label={ReactHtmlParser(this.props.t('TEAM.firstname'))}
                        value={modeDialog === 'admin' ? res.firstNameAdmin || '' : res.firstNameManager || ''}
                        name={modeDialog === 'admin' ? 'firstNameAdmin' : 'firstNameManager'}
                        onChange={e => this.handleChange(e, index)}
                        variant={'outlined'}
                        classes={{root: classes.textField}}
                      />
                    </Grid>
                    <Grid item xl={6} lg={6} sm={6} md={6} xs={6}>
                      <TextField
                        label={ReactHtmlParser(this.props.t('COMMON.lbl_name'))}
                        name={modeDialog === 'admin' ? 'nameAdmin' : 'nameManager'}
                        value={modeDialog === 'admin' ? res.nameAdmin || '' : res.nameManager || ''}
                        onChange={e => this.handleChange(e, index)}
                        variant={'outlined'}
                        classes={{root: classes.textField}}
                      />
                    </Grid>
                    <Grid item xl={modeDialog === 'manager' ? 6 : 12} lg={modeDialog === 'manager' ? 6 : 12} sm={modeDialog === 'manager' ? 6 : 12} md={modeDialog === 'manager' ? 6 : 12} xs={modeDialog === 'manager' ? 6 : 12}>
                      <TextField
                        label={ReactHtmlParser(this.props.t('COMMON.lbl_email'))}
                        name={modeDialog === 'admin' ? 'emailAdmin' : 'emailManager'}
                        value={modeDialog === 'admin' ? res.emailAdmin || '' : res.emailManager || ''}
                        onChange={e => this.handleChange(e, index)}
                        variant={'outlined'}
                        classes={{root: classes.textField}}
                      />
                    </Grid>
                    { modeDialog === 'manager' ?
                      <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
                        <FormControl variant="outlined" className={classes.formControl} style={{width: '100%'}}>
                          <InputLabel id="demo-simple-select-outlined-label">{ReactHtmlParser(this.props.t('TEAM.departements'))}</InputLabel>
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            name={'groupSelected'}
                            onChange={e => this.handleChange(e, index)}
                            label={ReactHtmlParser(this.props.t('TEAM.departements'))}
                            value={res.groupSelected || ''}
                          >
                            {
                              groups.map((res, index) => (
                                <MenuItem key={index} value={res._id}>{res.name}</MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </Grid> : null
                    }
                  </Grid>
                  <Grid item xl={1} lg={1} sm={1} md={1} xs={1} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <IconButton edge="end" aria-label="delete" onClick={e => this.removeLine(modeDialog === 'admin' ? 'nbAdmin' : 'nbManager', index, e)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
                <Divider/>
              </Grid>
            ))
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({dialogAdd: false})} classes={{root: classes.cancelButton}}>
            {ReactHtmlParser(this.props.t('COMMON.btn_cancel'))}
          </Button>
          <Button onClick={modeDialog === 'admin' ? this.addAdmin : mode === MICROSERVICE_MODE ? this.addManager : this.addEmploye} color="primary">
            {ReactHtmlParser(this.props.t('COMMON.btn_confirm'))}
          </Button>
        </DialogActions>
      </Dialog>
    )
  };

  dialogRemove = classes => {
    const{dialogRemove, selected, modeDialog} = this.state

    return(
      <Dialog
        open={dialogRemove}
        onClose={() => this.setState({dialogRemove: false})}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{paper: classes.dialogPaper}}
      >
        <MuiDialogTitle id="alert-dialog-title">{TEAM.dialog_remove_title}</MuiDialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {TEAM.dialog_remove_question + selected.email} ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({dialogRemove: false})} color="primary">
            {COMMON.btn_cancel}
          </Button>
          <Button onClick={modeDialog === 'admin' ? this.removeAdmin : this.removeManager} color="primary">
            {COMMON.btn_delete}
          </Button>
        </DialogActions>
      </Dialog>
    )
  };

  getCardById = card_id => {
    return this.state.cards.find(c => c.Id == card_id)
  }

  dialogGroupe = classes => {
    const{dialogGroupe, selected, paymentMethod, cards, nameGroupe, plafondGroupe, budget_period} = this.state
    const {mode} = this.props

    return(
      <Dialog open={dialogGroupe} onClose={() => this.setState({dialogGroupe: false})} aria-labelledby="form-dialog-title" classes={{paper: classes.dialogPaper}}>
        <DialogTitle id="customized-dialog-title" onClose={() => this.setState({dialogGroupe: false})} >{mode === MICROSERVICE_MODE ? TEAM.dialog_group_add : TEAM.dialog_group_add_b2b}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} style={{width: '100%', margin: 0}}>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <h3>{mode === MICROSERVICE_MODE ? TEAM.dialog_groupe_title : TEAM.dialog_groupe_title_b2b}</h3>
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} container spacing={2} style={{width: '100%', margin: 0}}>
              <Grid item xl={12} lg={12} sm={12} md={12} xs={12}>
                <TextField
                  label={TEAM.dialog_groupe_name}
                  name={'nameGroupe'}
                  value={nameGroupe}
                  variant={'outlined'}
                  classes={{root: classes.textField}}
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item xl={6} lg={6} sm={6} md={6} xs={6}>
                <TextField
                  label={TEAM.dialog_groupe_plafond}
                  name={'plafondGroupe'}
                  value={plafondGroupe}
                  type={'number'}
                  variant={'outlined'}
                  classes={{root: classes.textField}}
                  onChange={this.handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">€</InputAdornment>,
                    inputProps: {min: 0},
                  }}
                />
              </Grid>
              <Grid item xl={6} lg={6} sm={6} md={6} xs={6}>
                <FormControl variant="outlined" className={classes.formControl} style={{width: '100%'}}>
                  <InputLabel id="demo-simple-select-outlined-label">Période</InputLabel>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={budget_period}
                    name={'budget_period'}
                    label={'Période'}
                    onChange={this.handleChange}
                  >
                    {
                      Object.keys(BUDGET_PERIOD).map((res, index) => (
                        <MenuItem key={index} value={res}>{BUDGET_PERIOD[res]}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid item spacing={2} style={{width: '100%', margin: 0}}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <h3>Facturation</h3>
              </Grid>
              <Grid item container spacing={3} style={{width: '100%', margin: 0}}>
                <Grid item xl={12} lg={12}>
                  {
                    cards.length > 0 ?
                      <FormControl variant="outlined" className={classes.formControl} style={{width: '100%'}}>
                        <InputLabel id="demo-mutiple-chip-label">CBs</InputLabel>
                        <Select
                          labelId="demo-mutiple-chip-label"
                          id="demo-mutiple-chip"
                          multiple
                          onChange={e => this.handleChange(e)}
                          name={'paymentMethod'}
                          value={paymentMethod}
                          input={<OutlinedInput label={'CB'} id="select-multiple-chip" />}
                          renderValue={card_ids => {
                            return(
                              <div className={classes.chips}>
                                {card_ids.map(card_id => (
                                  <Chip key={card_id}label={this.getCardById(card_id).Alias} className={classes.chip} />
                                ))}
                              </div>
                            )
                          }}
                          MenuProps={MenuProps}
                        >
                          {cards.map(card => (
                            <MenuItem key={card.Id} value={card.Id} style={this.getStyles(name, paymentMethod)}>
                              {card.Alias}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl> :
                      <a href={'/account/paymentMethod'} target="_blank">Aucun moyen de paiement enregistré, rendez-vous ici pour en ajouter.</a>
                  }

                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({dialogGroupe: false})} classes={{root: classes.cancelButton}}>
            Annuler
          </Button>
          <Button onClick={selected === '' ? this.addGroupe : this.updateGroupe} color="primary">
            {selected === '' ? 'Confirmer' : 'Modifier'}
          </Button>
        </DialogActions>
      </Dialog>
    )
  };

  dialogRemoveGroupe = classes => {
    const{dialogRemoveGroupe, selected} = this.state

    return(
      <Dialog
        open={dialogRemoveGroupe}
        onClose={() => this.setState({dialogRemoveGroupe: false})}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{paper: classes.dialogPaper}}
      >
        <MuiDialogTitle id="alert-dialog-title">{'Supprimer'}</MuiDialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Voulez vous supprimer {selected.name} ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({dialogRemoveGroupe: false})} color="primary">
            Annuler
          </Button>
          <Button onClick={this.removeGroupe} color="primary">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    )
  };

  openEmployeeImport = () => {
    this.setState({dialogEmployeeImport: true})
  }

  dialogEmployeeImport = classes => {
    return (
      <EmployeeImportDialog classes={classes} />
    )
  }
  render() {
    const{classes, mode} = this.props
    const{managers_sort, groups, admins, managers, consumed_budgets, dialogRemoveGroupe, dialogGroupe, dialogRemove, dialogAdd, dialogEmployeeImport} = this.state

    return(
      <Grid container spacing={3} style={{marginTop: '3vh', width: '100%', margin: 0}}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <Grid style={{display: 'flex', alignItems: 'center'}}>
            <Grid>
              <h3>Administrateurs</h3>
            </Grid>
            <Grid>
              <IconButton aria-label="AddCircleOutlineOutlinedIcon" onClick={() => this.handleClickOpen('dialogAdd', null, 'admin')}>
                <AddCircleOutlineOutlinedIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <Box>
            {
              admins.length > 0 ?
                <Grid>
                  <List>
                    {admins.map((res, index) => (
                      <>
                        <ListItem key={index}>
                          <ListItemText
                            primary={res.full_name}
                            secondary={res.email}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => this.handleClickOpen('dialogRemove', res, 'admin')}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                      </>
                    ))}
                  </List>
                </Grid> :
                <Grid>
                  <Typography>Aucun administrateur n'est défini</Typography>
                </Grid>
            }
          </Box>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <Grid style={{display: 'flex', alignItems: 'center'}}>
            <Grid>
              <h3>{mode === MICROSERVICE_MODE ? 'Départements' : 'Classification'}</h3>
            </Grid>
            <Grid>
              <IconButton aria-label="AddCircleOutlineOutlinedIcon" onClick={() => this.handleClickOpen('dialogGroupe')}>
                <AddCircleOutlineOutlinedIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <Box>
            <Grid>
              {groups.length > 0 ?
                <List>
                  {
                    groups.map((res, index) => (
                      <>
                        <ListItem key={index}>
                          <ListItemText
                            primary={res.name}
                            secondary={res.budget ? `${res.budget}€ / ${BUDGET_PERIOD[res.budget_period]}` : 'Pas de budget défini'}
                          />
                          { consumed_budgets[res._id] ?
                            <ListItemText secondary={`${consumed_budgets[res._id]}€ disponibles`} />
                            :
                            null
                          }
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="update" onClick={() => this.handleClickOpen('dialogGroupe', res)}>
                              <SettingsIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => this.handleClickOpen('dialogRemoveGroupe', res)}>
                              <DeleteIcon/>
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                      </>
                    ))}
                </List>
                :
                <Grid>
                  <Typography>Aucun département n'est défini</Typography>
                </Grid>
              }
            </Grid>
          </Box>
        </Grid>
        {
          groups.length > 0 ?
            <>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Grid style={{display: 'flex', alignItems: 'center'}}>
                  <Grid>
                    <h3>{mode === MICROSERVICE_MODE ? 'Managers' : 'Collaborateurs'}</h3>
                  </Grid>
                  <Grid container style={{marginLeft: '1vh'}}>
                    <Grid>
                      <IconButton aria-label="AddCircleOutlineOutlinedIcon" onClick={() => this.handleClickOpen('dialogAdd', null, 'manager')}>
                        <AddCircleOutlineOutlinedIcon />
                      </IconButton>
                    </Grid>
                    <Grid>
                      <IconButton aria-label="GetAppOutlinedIcon" onClick={this.openEmployeeImport}>
                        <GetAppOutlinedIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid className={classes.searchFilterRightContainer}>
                  <Grid className={classes.searchFilterRightLabel}>
                    <Typography>Trier par</Typography>
                  </Grid>
                  <Grid>
                    <FormControl>
                      <Select
                        labelId="simple-select-placeholder-label-label"
                        id="simple-select-placeholder-label"
                        value={managers_sort}
                        name={'managers_sort'}
                        onChange={this.handleChange}
                        displayEmpty
                        disableUnderline
                        classes={{select: classes.searchSelectPadding}}
                      >
                        <MenuItem value={FILTER_ALPHA}><strong>{FILTER_ALPHA}</strong></MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Grid container spacing={3}>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Box>
                      <Grid>
                        <List>
                          {!managers ? null :
                            managers.map((res, index) => {
                              let groupe = groups.find(group => group.members.map(m => m._id).includes(res._id))
                              let groupeId = groupe ? groupe._id : ''
                              return(
                                <Grid key={index}>
                                  <ListItem key={index}>
                                    <ListItemText
                                      primary={res.full_name}
                                      secondary={res.email}
                                    />
                                    <ListItemSecondaryAction>
                                      {
                                        !groups.length > 0 ? null :
                                          <FormControl className={classes.formControl}>
                                            <InputLabel id="demo-simple-select-label">Département</InputLabel>
                                            <Select
                                              labelId="demo-simple-select-label"
                                              id="demo-simple-select"
                                              value={groupeId}
                                              onChange={e => this.handleChange(e, null, res)}
                                              name={'groupName'}
                                            >
                                              {
                                                groups.map((res, index) => (
                                                  <MenuItem key={index} value={res._id}>{ res.name}</MenuItem>
                                                ))
                                              }
                                            </Select>
                                          </FormControl>
                                      }
                                      <IconButton edge="end" aria-label="delete" onClick={() => this.handleClickOpen('dialogRemove', res, 'manager', groupeId)}>
                                        <DeleteIcon/>
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                  <Divider/>
                                </Grid>
                              )
                            },
                            )}
                        </List>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </> : null
        }
        {dialogGroupe ? this.dialogGroupe(classes) : null}
        {dialogAdd ? this.dialogAdd(classes) : null}
        {dialogRemove ? this.dialogRemove(classes) : null}
        {dialogRemoveGroupe ? this.dialogRemoveGroupe(classes) : null}
        {dialogEmployeeImport ? this.dialogEmployeeImport(classes) : null}
      </Grid>
    )
  }
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(Team))
