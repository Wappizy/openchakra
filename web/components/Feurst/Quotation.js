const {withTranslation}=require('react-i18next')
const React=require('react')
const {Page, Text, View, Document, StyleSheet, Image, Font}=require('@react-pdf/renderer')
const moment=require('moment')
import pdfStyle from '../../static/css/components/BillingGeneration/BillingGeneration'

const styles = StyleSheet.create(pdfStyle())
moment.locale('fr')

Font.register({
  family: 'SourceSansPro', fonts: [
    {src: 'https://fonts.gstatic.com/s/sourcesanspro/v14/6xK3dSBYKcSV-LCoeQqfX1RYOo3aPw.ttf'},
    {src: 'https://fonts.gstatic.com/s/sourcesanspro/v14/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rAkA.ttf', fontWeight: 600},
  ],
})


class Quotation extends React.Component {
  constructor(props) {
    super(props)
  }


  render() {
    const {infos, precos}=this.props

    const lines=[]
    Object.keys(precos.accessories).forEach(k => {
      const group=k
      Object.keys(precos.accessories[k]).forEach(k2 => {
        const fixType=k2
        precos.accessories[k][k2].forEach((elt, idx) => {
          let groupLabel=`${group}${fixType=='PIN' ? ' (à claveter)' : fixType=='SOLD' ? ' (à souder)': ''}`
          const nbOptions=precos.accessories[k][k2].length
          if (nbOptions>1) {
            groupLabel=`${groupLabel} option ${idx+1}`
          }
          Object.entries(elt).forEach(ent => {
            const [name, [ref, qty]]=ent
            lines.push([groupLabel, `${name} ${ref}`, qty])
            groupLabel=''
          })
        })
      })
    })

    return (
      <Document>
        <Page pageNumber={'1'} size="A4" style={styles.body}>
          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}
          >
            <View>
              <Image src={'./static/assets/icon/feurst.png'}
                alt={'logo_myAlfred'}
                style={{
                  height: 64,
                }}/>
            </View>
            <View>
              <View style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
              }}>
                <View><Text>FEURST</Text></View>
                <View><Text>Boulevard de la Boissonnette</Text></View>
                <View><Text>42110 FEURS</Text></View>
                <View><Text>France</Text></View>
                <View><Text>RCS: 388 420 556</Text></View>
              </View>
            </View>
          </View>
          <View>
            <Text style={styles.title}>Préconisation</Text>
          </View>

          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View>
              <Text style={styles.objectHead}>Objet :</Text>
            </View>
            <View>
              <Text>Configuration pour {infos.type} {infos.mark} {infos.model}</Text>
            </View>
          </View>

          <View style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: '3vh',

          }}>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
            }}>
              <View>
                <Text style={styles.objectHead}>Pour : </Text>
              </View>
              <View style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <View>
                  <Text>{infos.name}</Text>
                </View>
                <View>
                  <Text>{infos.company}</Text>
                </View>
                <View>
                  <Text>{infos.email}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeaderModule}>
                <Text style={{
                  margin: '5 2 5 0',
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'center',
                }}>Module</Text>
              </View>
              <View style={styles.tableColHeaderDescription}>
                <Text style={styles.tableCellHeader}>Reference</Text>
              </View>
              <View style={styles.tableColHeaderQuantity}>
                <Text style={styles.tableCellHeaderNum}>Quantité</Text>
              </View>
            </View>
            {
              lines.map(l => {
                return (
                  <View style={styles.tableRow}>
                    <View style={styles.tableColModule}>
                      <Text style={styles.tableCell}>{l[0]}</Text>
                    </View>
                    <View style={styles.tableColDescription}>
                      <Text style={styles.tableCell}>{l[1]}</Text>
                    </View>
                    <View style={styles.tableColQuantity}>
                      <Text style={styles.tableCellNum}>{l[2]}</Text>
                    </View>
                  </View>
                )
              })
            }
          </View>
          <View>
            <View style={{display: 'flex', flexDirection: 'row'}}>
              <View>
                <Text style={styles.object}>Date de la facture</Text>
              </View>
              <View>
                <Text>La date</Text>
              </View>
            </View>
            <View style={{display: 'flex', flexDirection: 'row'}}>
              <View>
                <Text style={styles.object}>Date de paiement : </Text>
              </View>
              <View>
                <Text>L'autre date</Text>
              </View>
            </View>
          </View>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View>
              <Text style={styles.object}>Référence de transaction : </Text>
            </View>
            <View>
              <Text>IDENTIFIANT</Text>
            </View>
          </View>
          <View style={styles.infos}>
            <Text>
              Pour toute question concernant cette facture, veuillez nous contacter.
            </Text>
          </View>
          {/* Footer*/}
          <View fixed style={styles.footer}>
            <Text>Page {'1'}</Text>
          </View>
        </Page>
      </Document>
    )
  }
}

module.exports=withTranslation('custom', {withRef: true})((Quotation))
