import React, {useState} from 'react'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import {ACCOUNT, CREATE, API_PATH, LINK} from '../../utils/feurst/consts'
import ImportExcelFile from './ImportExcelFile'
import AccountLink from './AccountLink'
import FeurstRegister from './Register'
import {accountsColumns} from './tablestructures'
import BaseListTable from './BaseListTable'
import {NormalButton} from './Button'

const PureDialog = dynamic(() => import('../Dialog/PureDialog'))

const AccountsList = ({accessRights}) => {

  const [refresh, setRefresh]=useState(false)
  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const toggleRefresh= () => setRefresh(!refresh)

  const canAddAccount = accessRights.isActionAllowed(ACCOUNT, CREATE)


  // TODO: Import action for FEURST_AD%MIN only
  // const IMPORTS=[{title: 'Import clients/compagnies/tarification', url: `${API_PATH}/users/import`}]
  const IMPORTS=[]
  return (
    <>
      <div>
        {IMPORTS.map((imp, i) => (<ImportExcelFile key={`imp${i}`} caption={imp.title} importURL={imp.url} templateURL={null} onImport={toggleRefresh}/>))}
      </div>

      {canAddAccount &&
      <div className='container-md mb-8'>
        <NormalButton onClick={() => setIsOpenDialog(true)} rounded={'full'} size={'full-width'}><span>⊕</span> Ajouter un compte</NormalButton>
      </div>
      }

      {/* {accessRights.isActionAllowed(ACCOUNT, LINK) && <AccountLink />} */}
      <BaseListTable caption='Liste des comptes' endpoint='users' columns={accountsColumns} refresh={refresh} accessRights={accessRights}/>

      <AddAccountDialog title={'Ajouter un compte'} open={isOpenDialog}
        onClose={() => setIsOpenDialog(false)} >
        <FeurstRegister onSuccess={toggleRefresh} onClose={() => setIsOpenDialog(false)}/>
      </AddAccountDialog>
    </>
  )
}


const AddAccountDialog = styled(PureDialog)`

  h2 {
    text-align: center;
    color: var(--black);
    margin-bottom: var(--spc-8);
  }

  .dialogcontent {
    aspect-ratio: 1 / 1;
    max-width: 30rem;
  }
`

export default AccountsList
