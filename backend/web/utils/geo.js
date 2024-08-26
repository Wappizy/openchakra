const nominatim=require('nominatim-client')
const lodash=require('lodash')

const getLocationSuggestions = (value, type) => {
  const cityOnly=type=='city'
  const client = nominatim.createClient({
    useragent: 'My Alfred',
    referer: 'https://my-alfred.io',
  })
  const query={dedupe:1, addressdetails: 1, countrycodes: 'fr'}
  if (cityOnly) {
    query.city=value
  }
  else {
    query.q=value
  }
  return client.search(query)
    .then(res => {
      let suggestions=lodash.orderBy(res, r => -r.importance)
      if (cityOnly) {
        suggestions=res.filter(r => r.address && r.lat && r.lon && ((r.address.city || r.address.village || r.address.town || r.address.county)))
      }
      else {
        suggestions=res.filter(r => r.address && r.lat && r.lon && (r.address.postcode && r.address.road && (r.address.city || r.address.village || r.address.town || r.address.county)))
      }
      suggestions=suggestions.map(r => ({
        address: r.address.road,
        city: r.address.city || r.address.village || r.address.town || r.address.county,
        zip_code: r.address.postcode,
        country: r.country,
        latitude: r.lat,
        longitude: r.lon}))
      suggestions=lodash.uniqBy(suggestions, r => (cityOnly ? `${r.city},${r.postcode},${r.country}`: `${r.name},${r.city},${r.postcode},${r.country}`))
      const number=parseInt(value)
      if (!isNaN(number)) {
        suggestions=suggestions.map(r => ({...r, address: `${number} ${r.address}`}))
      }
      return suggestions
    })
}

module.exports={getLocationSuggestions}
