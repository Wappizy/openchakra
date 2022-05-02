import React, {useState} from 'react'
const {Grid} = require('@material-ui/core')
const {API_PATH} = require('../../utils/feurst/consts')
const ImportExcelFile = require('./ImportExcelFile')

const {productsColumns} = require('./tablestructures')
const BaseListTable = require('./BaseListTable')

const ProductsList = ({accessRights}) => {

  const IMPORTS=[
    {title: 'Import articles', url: `${API_PATH}/products/import`},
    {title: 'Import stock', url: `${API_PATH}/products/import-stock`},
  ]

  const [refresh, setRefresh]=useState(false)

  const toggleRefresh= () => setRefresh(!refresh)

  return (
    <>
      <div display='flex' flexDirection='row'>
        {IMPORTS.map(imp => (<ImportExcelFile caption={imp.title} importURL={imp.url} templateURL={null} onImport={toggleRefresh}/>))}
      </div>
      <BaseListTable caption='Liste des articles' endpoint='products' columns={productsColumns} />
    </>
  )
}

module.exports=ProductsList
