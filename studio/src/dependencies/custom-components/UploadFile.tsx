import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react';
import axios from 'axios'
import styled from '@emotion/styled'
import { ACTIONS } from '../utils/actions';
import Media from './Media';

const uploadUrl = `/myAlfred/api/studio/s3uploadfile`

const uploadFileToS3 = (file: File) => {

  const formData = new FormData();
  formData.append('document', file)

  return axios.post(uploadUrl, formData,
    {
      headers: {
      'Content-Type': 'multipart/form-data'
      },
    }
  )
}


const UploadFile = ({
  model,
  notifmsg,
  okmsg = 'Ressource ajoutée',
  komsg = 'Échec ajout ressource',
  prvmsg = '',
  previewmsg,
  preview,
  previewtype = false,
  dataSource,
  attribute,
  value,
  children,
  reload,
  noautosave,
  clearComponents,
  ...props
}: {
  model: string
  notifmsg: boolean
  okmsg: string
  komsg: string
  prvmsg: string
  previewmsg: boolean
  preview: boolean
  previewtype: boolean
  dataSource: { _id: null } | null
  attribute: string
  value: string
  reload: any
  noautosave: boolean | null
  children: React.ReactNode
  clearComponents: [string]
}) => {

  const [uploadInfo, setUploadInfo] = useState(dataSource?.[attribute] ? okmsg : '')
  const [isLoading, setIsLoading] = useState(false)
  const [s3File, setS3File] = useState<string|null>(dataSource?.[attribute] || null)
  const [fileName, setFileName] = useState<string>('')

  useEffect(() => {
    if (!!model && clearComponents.includes(props.id)) {
      console.log(`Clear ${props.id} contents`)
      setS3File(null)
      setUploadInfo('')
    }
  }, [clearComponents])

  const onFileNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const currentFile = e.target.files && e.target.files[0]
    if (currentFile) {
      if(previewmsg) {
        setFileName(currentFile.name)
      }
      await handleUpload(currentFile)
    }
  }

  const handleUpload = async (fileToUpload: File) => {

      let paramsBack = {
        action: 'put',
        parent: dataSource?._id,
        attribute,
        value: '',
      }

      setUploadInfo('')

      const uploadFile = async () => {

        setIsLoading(true)
        await uploadFileToS3(fileToUpload)
          .then(async result => {
            // @ts-ignore
            const filepath = result?.data
            console.log(`s3 file:${filepath}`)
            setS3File(filepath)
            paramsBack = { ...paramsBack, value: filepath}
            setUploadInfo(okmsg)

            if (dataSource && !noautosave) {
              typeof filepath === 'string' && await saveUrl(filepath)
              reload()
            }
          })
          .catch(err => {
            console.error(err)
            setUploadInfo(komsg)
          })
          .finally(() => {
            setIsLoading(false)
          })
      }

      const saveUrl = async (url:string) => {
        const promise=noautosave ?
          Promise.resolve(null)
          :
          ACTIONS.putValue({
            context: dataSource?._id,
            props: {attribute: attribute},
            value: url,
          })
        promise
          .then(() => {
            if (notifmsg) {
              setUploadInfo(okmsg)
            }
          })
          .catch(e => {
            console.error(e)
            setUploadInfo('Échec ajout ressource')
          })
      }

      await uploadFile()
    }

  // SAU to propagate attribute
  const pr={...props, attribute, value: s3File}

  const [isPreviewOpen, setPreviewOpen] = useState(false);

  const togglePreview = () => {
    setPreviewOpen(!isPreviewOpen)
  }

  return (
    <Box>
      <Box {...pr} data-value={s3File} display='flex' flexDirection='row' position={'relative'} alignItems={'center'}>
        <form id="uploadressource">
          <UploadZone>
            <input type="file" onChange={onFileNameChange} />
            {/* Whatever in children, it brings focus on InputFile */}
            {children}
          </UploadZone>
        </form>
    
        {uploadInfo && (
          // @ts-ignore
          <Text alignSelf={'center'} ml={2}>{uploadInfo}</Text> 
        )}
    
        {fileName && uploadInfo && (
          <Text alignItems={'center'} ml={1}>:</Text>
        )}
    
        {fileName && (
          <Text ml={1}>{fileName}</Text>
        )}
        
        {isLoading && <Loading />}
        
        {preview && previewtype && s3File &&(
          <Button {...props} ml={2} onClick={togglePreview}>Preview</Button>
        )}

        {/* Modal for previewing the media */}
        {preview && previewtype && (
          <Modal isOpen={isPreviewOpen} onClose={togglePreview}>
            <ModalOverlay />
            <ModalContent height="80%" maxWidth="80%">
              <ModalHeader>Media Preview</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Media src={s3File} />
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </Box>
      {preview && !previewtype && (
        <Box
        width='10%'
        height='10%'>
        <Media 
          src={s3File}
          ></Media>
        </Box>
      )}
    </Box>
  )
}

const Loading = styled.div`
  display: block;
  position: absolute;
  z-index: 999;

  &:after {
    content: " ";
    display: block;
    min-width: 40px;
    width: inherit;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    border: 6px solid #333;
    border-color: #333 transparent #333 transparent;
    animation: lds-dual-ring 1.2s linear infinite;
  }
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`

const UploadZone = styled.label`
  input[type='file'] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  *:not(input[type='file']) {
    pointer-events: none;
  }
`

export default UploadFile
