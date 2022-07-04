import React, {useState} from 'react'
import ReactHtmlParser from 'react-html-parser'
import styled from 'styled-components'
import {withTranslation} from 'react-i18next'
import {useRouter} from 'next/router'
import {API_PATH} from '../../utils/consts'
import {client} from '../../utils/client'
import {snackBarSuccess, snackBarError} from '../../utils/notifications'
import RenewPassword from '../../components/Password/RenewPassword'
import {NormalButton} from '../../components/Feurst/Button'
import EdiContainer from '../../components/Feurst/EdiContainer'
import {BASEPATH_EDI} from '../../utils/feurst/consts'

const ResetPassword = ({t}) => {

  const [password, setPassword] = useState('')
  const [passChanged, setPassChanged] = useState(false)
  const canSubmitPassword = !!(password?.check1 && password?.check2)
  const router = useRouter()

  const resetPassword = async e => {
    e.preventDefault()

    const data = {
      password: password.newPassword,
      token: router.query?.token,
    }

    return await client(`${API_PATH}/users/resetPassword`, {data})
      .then(() => {
        snackBarSuccess(ReactHtmlParser(t('RESET_PASSWORD.password_update')))
        router.push(BASEPATH_EDI)
      })
      .catch(err => {
        console.error(err)
        snackBarError(err?.response?.data)
      })
  }


  return (
    <EdiContainer>
      <div />
      <StyledReset>
        <h2>{ReactHtmlParser(t('RESET_PASSWORD.title'))}</h2>

        <form onSubmit={resetPassword}>

          <RenewPassword passChanged={passChanged} setPassword={setPassword} />

          <NormalButton
            rounded={'full'}
            disabled={!canSubmitPassword}
            type='submit'
            onClick={() => resetPassword}
          >
            Enregistrer le nouveau mot de passe
          </NormalButton>
        </form>

      </StyledReset>

    </EdiContainer>
  )
}

const StyledReset = styled.div`

  padding-top: var(--spc-4);
  border-top: 1px solid var(--black);
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-template-columns: 1fr;

  h2 {
    color: var(--black);
    font-size: var(--text-2xl);
  }

  form {
    display: flex;
    flex-direction: column;
    width: min(calc(100% - 2rem), 30rem);
    margin-bottom: var(--spc-10);

    & > div {
      margin-bottom: var(--spc-4);
    }
  }

  button[type="submit"] {
    align-self: flex-end;
    margin-block: var(--spc-4);
  }

  em {
    margin-bottom: var(--spc-4);
  }
`

export default withTranslation('custom', {withRef: true})(ResetPassword)
