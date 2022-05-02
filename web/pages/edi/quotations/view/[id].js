import React from 'react'
import {useRouter} from 'next/router'
import withEdiAuth from '../../../../hoc/withEdiAuth'
import BaseCreateTable from'../../../../components/Feurst/BaseCreateTable'
const {BASEPATH_EDI, QUOTATION, VIEW} = require('../../../../utils/consts')
const {orderViewColumns} = require('../../../../components/Feurst/tablestructures')


const View = ({accessRights}) => {

  const router = useRouter()
  const quotationid = router.query.id

  return (<>
    <BaseCreateTable
      id={quotationid}
      storage={'quotationview'}
      endpoint='quotations'
      columns={orderViewColumns}
      wordingSection={'EDI.QUOTATION'}
      accessRights={accessRights}
    />
  </>)
}

module.exports=withEdiAuth(View, {model: QUOTATION, action: VIEW, pathAfterFailure: `${BASEPATH_EDI}/login`})
