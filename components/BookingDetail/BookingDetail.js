import React from 'react';
import styles from './BookingDetailStyle'
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

class BookingDetail extends React.Component{
  constructor(props) {
    super(props);
  }

  render() {
    const {classes, prestations, count, travel_tax, pick_tax, total, alfred_fee, client_fee} = this.props;

    return (
      <Grid>
        <Grid>
          { Object.keys(prestations).map( k => {
            return count[k] ===0 ? null: (
              <Grid className={classes.flexContent}>
                <Grid>
                  <p>{k}</p>
                </Grid>
                <Grid>
                  <p>{prestations[k].toFixed(2)}€</p>
                </Grid>
              </Grid>
            )})
          }
          { /* Start travel tax */ }
          { travel_tax ?
            <Grid className={classes.flexContent}>
              <Grid>
                <p>Frais de déplacement</p>
              </Grid>
              <Grid>
                <p>{travel_tax.toFixed(2)}€</p>
              </Grid>
            </Grid>:null}
          { /* End pick tax */ }
          { /* Start pick tax */ }
          { pick_tax  ?
            <Grid className={classes.flexContent}>
              <Grid>
                <p>Frais de livraison/enlèvement</p>
              </Grid>
              <Grid>
                <p>{pick_tax.toFixed(2)}€</p>
              </Grid>
            </Grid>:null}
          { /* End pick tax */ }
          { /* Start commission */ }
          {client_fee && client_fee !== 0 ?
            <Grid className={classes.flexContent}>
              <Grid>
                <p>Frais de service</p>
              </Grid>
              <Grid>
                <p>{client_fee.toFixed(2)}€</p>
              </Grid>
            </Grid> : null
          }
          {alfred_fee ?
            <Grid className={classes.flexContent}>
              <Grid>
                <p>Frais de service</p>
              </Grid>
              <Grid>
                <p>-{alfred_fee.toFixed(2)}€</p>
              </Grid>
            </Grid> : null
          }
          { /* End commission */ }
          { /* Start total */ }
          <Grid className={classes.flexContent}>
            <Grid>
              <p>{client_fee !== undefined ? "Total" : "Total à percevoir"}</p>
            </Grid>
            <Grid>
              <p>{total.toFixed(2)}€</p>
            </Grid>
          </Grid>
          { /* End total */ }
        </Grid>

      </Grid>
    );
  }
}

export default  withStyles(styles, { withTheme: true })(BookingDetail)
