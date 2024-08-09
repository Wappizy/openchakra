import * as LZString from 'lz-string'

const createShareUrl = (components: IComponents) =>
  `${document.location.protocol}//${
    document.location.host
  }/?share=${LZString.compressToEncodedURIComponent(
    JSON.stringify(components),
  )}`

const decodeShareUrl = (): IComponents | null => {
  try {
    const searchParams = new URLSearchParams(document.location.search)
    const sharedData = searchParams.get('share')

    if (sharedData) {
      return JSON.parse(LZString.decompressFromEncodedURIComponent(sharedData))
    }
  } catch (e) {
    console.error(e)
  }

  return null
}

module.exports = {
  decodeShareUrl,
  createShareUrl
}