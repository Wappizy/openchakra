import { buildCard } from './CardBuilder'
import { registerComponent } from '~components/register'
import Card from './Card'
import CardPanel from './CardPanel'
import CardPreview from './CardPreview'

console.log('Registering Card')
registerComponent({
  componentType: 'Card',
  component: Card,
  menuChildren: {
    children: {
      Alert: {},
      AlertDescription: {},
      AlertIcon: {},
      AlertTitle: {},
    },
  },
  previewComponent: CardPreview,
  componentPanel: CardPanel,
  builderFunction: buildCard,
  defaultProps: { bg: 'green.500' },
})
