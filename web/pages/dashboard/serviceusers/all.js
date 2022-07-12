import {withTranslation} from 'react-i18next'
import {withStyles} from '@material-ui/core/styles'
import axios from 'axios'
import {bookingUrl} from '../../../config/config'
const {DataPage, styles}=require('../../../components/AlfredDashboard/DataPage')
const models=require('../../../components/BigList/models')


class all extends DataPage {

  getColumnDefs = () => {
    return [
      {headerName: '_id', field: '_id', width: 0},
      models.textColumn({headerName: 'Email', field: 'user.email'}),
      models.booleanColumn({headerName: 'Pro', field: 'user.shop.is_professional'}),
      models.textColumn({headerName: 'Service', field: 'service.label'}),
      models.textColumn({headerName: 'Catégorie', field: 'service.category.label'}),
      {headerName: `Localisation (Client/${this.props.t('DASHBOARD.alfred')}/Visio)`, field: 'location', cellRenderer: 'locationRenderer'},
      {headerName: 'Code postal', field: 'service_address.zip_code'},
      models.textColumn({headerName: 'Ville', field: 'service_address.city'}),
      models.textColumn({headerName: 'Frais dep.', field: 'travel_tax_str'}),
      models.warningColumn({headerName: 'Warning', field: 'warning'}),
    ]
  }

  getTitle = () => {
    return `Services (${this.props.t('DASHBOARD.alfred')})`
  }

  loadData = () => {
    axios.get('/myAlfred/api/admin/serviceusers/all')
      .then(response => {
        let services = response.data
        services.forEach(s => {
          try {
            s.user.shop.is_professional = Boolean(s.user.shop[0].is_professional)
            s.warning = !s.service.picture ? "Pas d'illustration" : null
            s.travel_tax_str = s.travel_tax ?
              `${s.travel_tax.rate}€/km (>=${s.travel_tax.from}km)`: ''
          }
          catch (error) {
            console.error(`Err on ${s._id}:${error}`)
          }
        })
        this.setState({data: services})
      })
  }

  onCellClicked = (data, field) => {
    if (field=='service.label') {
      window.open(bookingUrl(data._id), '_blank')
    }
    else {
      window.open(`/profile/about?user=${data.user._id}`, '_blank')
    }
  }

}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(all))
