import {withTranslation} from 'react-i18next'
import React from 'react'

class CompanyComponent extends React.Component {
  isModeCompany = () => {
    return Boolean(this.state.company)
  }
}

module.exports = CompanyComponent
