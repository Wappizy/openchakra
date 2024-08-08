import { fileOpen, fileSave } from 'browser-fs-access'
import { INITIAL_COMPONENTS } from '~core/models/project'
import { upgradeProject } from '~utils/upgrade'
import { ProjectState } from '~core/models/project'

export async function loadFromJSON() {
  const blob = await fileOpen({
    extensions: ['.json'],
    mimeTypes: ['application/json'],
  })

  const contents: string = await new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsText(blob, 'utf8')
    reader.onloadend = () => {
      if (reader.readyState === FileReader.DONE) {
        resolve(reader.result as string)
      }
    }
  })

  try {
    const parsed=JSON.parse(contents)
    return upgradeProject(parsed)
  } catch (error) {
    alert(error)
  }

  return INITIAL_COMPONENTS
}

export async function saveAsJSON(components: ProjectState) {

  const projectName = components?.settings?.name?.toLowerCase()
  const nomw = new Date().toISOString().slice(0, -5)

  const serialized = JSON.stringify(components, null, 2)
  const name = `${projectName}_${nomw}.json`

  await fileSave(
    new Blob([serialized], { type: 'application/json' }),
    {
      fileName: name,
      description: 'OpenChakra file',
    },
    (window as any).handle,
  )
}