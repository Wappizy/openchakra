import React from 'react'
import { Global } from '@emotion/react'

const Fonts = () => (
  <Global
    styles={`
      /* latin */
      @font-face {
        font-family: Tomarik;
        src: local('Tomarik Display Line'), local('Tomarik-Display-Line'),
            url('fonts/Tomarik-DisplayLine.woff2') format('woff2'),
            url('fonts/Tomarik-DisplayLine.woff') format('woff'),
            url('fonts/Tomarik-DisplayLine.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: Radikal;
        src: local('Radikal'), local('Radikal Bold'),
            url('fonts/Radikal-Bold.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Radikal Thin';
        src: local('Radikal Thin'), local('Radikal-Thin'),
            url('fonts/Radikal-Thin.woff') format('woff');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Futura';
        src: local('Futura'), 
            url('fonts/Futura-medium.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Digital-7';
        src: local('digital 7'), local('digital-7'),
            url('fonts/digital-7.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Cabin';
        src: local('Cabin'), 
            url('fonts/Cabin-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Cabin';
        src: local('Cabin'), 
            url('fonts/Cabin-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'DancingScript';
        src: local('DancingScript'), 
            url('fonts/DancingScript-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'DancingScript';
        src: local('DancingScript'), 
            url('fonts/DancingScript-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'Playfair Display';
        src: local('Playfair Display'), 
            url('fonts/PlayfairDisplay-regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }

      /* Fontes all-inclusive */
      @font-face {
        font-family: 'Crapaud';
        src: local('Crapaud'), 
            url('fonts/crapaud_petit.ttf') format('truetype');
        font-weight: lighter;
        font-style: normal;
      }
      @font-face {
        font-family: 'Crapaud';
        src: local('Crapaud'), 
            url('fonts/crapaud_gros.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'berthold-akzidenz';
        src: local('berthold-akzidenz-grotesk'), 
            url('fonts/berthold-akzidenz-grotesk.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'berthold-akzidenz condensed';
        src: local('berthold-akzidenz-grotesk condensed'), 
            url('fonts/berthold-akzidenz-grotesk-be-condensed.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'inter-bold';
        src: local('Inter'), 
            url('fonts/Inter-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'inter-medium';
        src: local('Inter'), 
            url('fonts/Inter-Medium.ttf') format('truetype');
        font-weight: medium;
        font-style: normal;
      }
      @font-face {
        font-family: 'inter';
        src: local('Inter'), 
            url('fonts/Inter-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'inter-semibold';
        src: local('Inter'), 
            url('fonts/Inter-SemiBold.ttf') format('truetype');
        font-weight: semibold;
        font-style: normal;
      }
      @font-face {
        font-family: 'minion pro';
        src: local('Inter'), 
            url('fonts/MinionPro-Regular.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'handjet';
        src: local('Handjet'), 
            url('fonts/Handjet-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'handjet';
        src: local('Handjet'), 
            url('fonts/Handjet-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'Honk';
        src: local('Honk'), 
            url('fonts/Honk-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'minion pro';
        src: local('Inter'), 
            url('fonts/MinionPro-Regular.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'TitilliumWeb';
        src: local('TitilliumWeb'), 
            url('fonts/TitilliumWeb-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'TitilliumWeb';
        src: local('TitilliumWeb'), 
            url('fonts/TitilliumWeb-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'TitilliumWeb';
        src: local('TitilliumWeb'), 
            url('fonts/TitilliumWeb-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      `}
  />
)

export const fontsName = [
  'Crapaud',
  'berthold-akzidenz',
  'berthold-akzidenz condensed',
  'inter',
  'inter-bold',
  'inter-medium',
  'inter-semibold',
  'minion pro',
  'handjet',
  'honk',
  'TitilliumWeb'
]

export default Fonts
