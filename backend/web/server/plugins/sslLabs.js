const { default: axios } = require("axios")

const startSslScan = async (url) => {
  //url check
  try {
    new URL(url)
  } catch (e) {
    throw new Error(`L'url est invalide`)
  }

  //availability check
  const info=await axios.get(
    'https://api.ssllabs.com/api/v4/info', {
    headers: {email: EMAIL}
    }
  )

  if (info.data.maxAssesments - info.data.currentAssesment < 1) {
    throw new Error(`Service surchargé : veuillez réessayer dans quelques minutes`)
  }

  //scan
  const res=await axios.get(
    `https://api.ssllabs.com/api/v4/analyze?host=${url}&all=on`, {
    headers: {email: EMAIL}
    }
  )

  //not error 429 check
  if (res.status == 200) {
    throw new Error(`Service surchargé : veuillez réessayer dans quelques minutes`)
  }

  //success
}

module.exports = {
  startSslScan,
}