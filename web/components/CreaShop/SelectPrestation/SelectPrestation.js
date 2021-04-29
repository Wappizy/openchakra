const {setAxiosAuthentication}=require('../../../utils/authentication')
import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ButtonSwitch from '../../ButtonSwitch/ButtonSwitch';
import {Typography} from '@material-ui/core';
import axios from 'axios';
import styles from '../componentStyle';
import {CUSTOM_PRESTATIONS_FLTR, generate_id, GID_LEN} from '../../../utils/consts';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import _ from 'lodash';
const {getLoggedUserId}=require('../../../utils/functions')

class SelectPrestation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      grouped: [],
      prestations: this.props.prestations || {},
      service: null,
      service_name: '',
      all_billlings: [],
    };
    this.prestationSelected = this.prestationSelected.bind(this);
    this.addCustomPrestation = this.addCustomPrestation.bind(this);
    this.removeCustomPrestation = this.removeCustomPrestation.bind(this);
  }

  componentDidMount() {

    // Get current alfred id
    const alfred_id = getLoggedUserId()

    let billings = null;
    setAxiosAuthentication()
    axios.get(`/myAlfred/api/billing/all`)
      .then(res => {
        billings = res.data;
        this.setState({all_billings: billings});
      });
    axios.get(`/myAlfred/api/service/${this.props.service}`)
      .then(res => {
        let service = res.data;
        this.setState({service_name: service.label});
      })
      .catch(error => console.error(error));
    axios.get(`/myAlfred/api/prestation/${this.props.service}`)
      .then(res => {
        var prestations = res.data;
        // Remove private belonging to other Alfreds
        prestations = prestations.filter(p => p.private_alfred == null || p.private_alfred == alfred_id);
        let private_prestations = prestations.filter(p => p.private_alfred != null);
        let public_prestations = prestations.filter(p => p.private_alfred == null);
        let grouped = _.mapValues(_.groupBy(public_prestations, 'filter_presentation.label'),
          clist => clist.map(public_prestations => _.omit(public_prestations, 'filter_presentation.label')));
        let presta_templates = private_prestations.map(p => {
          return {...p, billing: billings};
        });
        grouped = {[CUSTOM_PRESTATIONS_FLTR]: presta_templates, ...grouped};
        this.setState({grouped: grouped});
      }).catch(error => {
      console.error(error);
    });
  }

  addCustomPrestation() {
    let grouped = this.state.grouped;
    let custom_presta = {
      _id: generate_id(),
      label: '',
      service: this.state.service,
      billing: this.state.all_billings,
      description: '',
      price: null,
    };
    grouped[CUSTOM_PRESTATIONS_FLTR].push(custom_presta);
    this.setState({grouped: grouped});
  }

  removeCustomPrestation(presta_id) {
    this.prestationSelected(presta_id, false);
    let grouped = this.state.grouped;
    grouped[CUSTOM_PRESTATIONS_FLTR] = grouped[CUSTOM_PRESTATIONS_FLTR].filter(p => p._id !== presta_id);
    this.setState({grouped: grouped});
  }

  prestationSelected(prestaId, checked, price, billing, label) {
    let sel = this.state.prestations;
    if (checked) {
      sel[prestaId] = {_id: prestaId, label: label, price: price, billing: billing};
    } else {
      delete sel[prestaId];
    }
    this.setState({prestations: sel});
    this.props.onChange(sel);
  }

  render() {
    // FIX : le billing par défaut n'ets pas sélectionné
    const {classes, prestations} = this.props;

    return (
      <Grid className={classes.mainContainer}>
        <Grid className={classes.contentContainer}>
          <Grid className={classes.maxWidth}>
            <Grid className={classes.contentLeftTop}>
              <Grid className={classes.contentTitle}>
                <Typography className={classes.policySizeTitle}>{this.state.service_name} : indiquez vos
                  prestations</Typography>
              </Grid>
            </Grid>
            <Grid className={classes.containerPrestas}>
              <Grid className={classes.bottomSpacer}>
                <Typography className={classes.policySizeContent}>Quelles prestations souhaitez-vous proposer ? Indiquez vos
                  tarifs et votre unité de facturation. </Typography>
              </Grid>
              <Grid className={classes.buttonAddPrestas}>
                <Grid item className={classes.maxWidth} style={{marginBottom: 100}}>
                  <Grid style={{marginBottom: 10}}>
                    <Fab variant="extended" color="primary" aria-label="add" onClick={() => this.addCustomPrestation()}
                         className={classes.margin}>
                      <AddIcon className={classes.extendedIcon}/>
                      Ajouter une prestation personnalisée
                    </Fab>
                  </Grid>
                  {Object.keys(this.state.grouped).map((fltr, i) => {
                    let prestas = this.state.grouped[fltr];
                    return (
                      <Grid key={i} className={classes.maxWidth}>
                        <Grid className={classes.marginThirty}>
                          <Grid item>
                            {fltr === 'Aucun' ? '' : fltr === 'Prestations personnalisées' && this.state.grouped['Prestations personnalisées'].length === 0 ? '' : fltr}
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          {prestas.map((p, j) => {
                            let isEditable = p._id.length == GID_LEN;
                            let presta = this.state.prestations[p._id];
                            return (
                              <Grid key={p._id} item xl={6} lg={6} md={6} sm={12} xs={12}>
                                <ButtonSwitch isOption={true} isPrice={true} width={'100%'} label={p.label} id={p._id}
                                              checked={presta != null}
                                              billings={p.billing} onChange={this.prestationSelected}
                                              isEditable={isEditable} price={presta ? presta.price : null}
                                              billing={presta ? presta.billing : null}/>
                                <hr style={{color: 'rgb(255, 249, 249, 0.6)', borderRadius: 10}}/>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Grid>
                    );
                  })
                  }
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(SelectPrestation);
