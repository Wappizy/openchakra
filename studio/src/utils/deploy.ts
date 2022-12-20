import { ProjectState } from '~/core/models/project'
import lodash from 'lodash'
import { build, copyFile, install, start } from './http'
import { generateCode, generateApp, normalizePageName } from './code'
import { validate } from './validation'

// If true, build target project when compliaiton fixed
const TARGET_BUILD = false

const copyCode = (pageName: string, contents: Buffer) => {
  return copyFile({
    contents: contents,
    filePath: `${normalizePageName(pageName)}.js`,
  })
}

export const deploy = (state: ProjectState, models: any) => {
  const pages = Object.values(state.pages)
  return Promise.all(
    pages.map(({ pageName, components }) => validate(components)),
  )
    .then(res => {
      if (res.length>0) {
        const error=lodash(pages.map((p, idx) => [p.pageName, res[idx]]))
          .fromPairs()
          .pickBy(v => v.length>0)
          .mapValues(v => v.map(err => `${err.component.id}:${err.message}`).join(','))
          .value()
        if (!lodash.isEmpty(error)) {
          throw new Error(JSON.stringify(error, null, 2))
        }
      }
      return Promise.all(
        pages.map(page => generateCode(page.pageId, state.pages, models)),
      )
    })
    .then(codes => {
      const namedCodes = lodash.zip(
        pages.map(nc => nc.pageName),
        codes,
      )
      return Promise.all(
        namedCodes.map(([pageName, code]) => copyCode(pageName, code)),
      )
    })
    .then(() => {
      return generateApp(state)
    })
    .then(code => {
      return copyCode('App', code)
    })
    .then(() => {
      return install()
    })
    .then(() => {
      return TARGET_BUILD ? build().then(() => start()) : true
    })
    .catch(err => {
      console.error(err)
      throw err
    })
}
