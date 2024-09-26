// @ts-nocheck
import React from 'react';
import {
  Chart as ChartJS,
  ChartType,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Scatter, Radar } from 'react-chartjs-2';
import { Box } from '@chakra-ui/react';
import { TypedChartComponent } from 'react-chartjs-2/dist/types';
import moment from 'moment'
import lodash from 'lodash'
import 'moment/locale/fr'
moment.locale('fr')

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
  );


const OwnChart = (
  {
    isEditable = false, // read-only or writable
    name,
    value,
    attribute,
    id,
    chartType = 'line',
    ...props
  }
    : {
      isEditable: boolean
      name: string
      value:{date:any, [key:string]: number, x:string, y:string}[]
      attribute: string
      id: string,
      chartType: ChartType,
      datasets: any,
    }) => {

      // TEST if font
      const isFontFamily = props.hasOwnProperty('fontFamily')
      const font = isFontFamily ? props.fontFamily?.base : 'inherit'
      const isFontSize = props.hasOwnProperty('fontSize')
      const fontSize = isFontSize ? (parseInt(props.fontSize?.base, 10) || 12 ) : 14

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: props.minX || undefined,
            max: props.maxX || undefined,
          },
          y: {
            min: props.minY || undefined,
            max: props.maxY || undefined,
          },
        },
        plugins: {
            legend: {
              position: 'bottom' as const,
              labels: {
                usePointStyle: true,
                font: {
                  family: isFontFamily ? font : 'inherit',
                  size: isFontSize ? fontSize : 12
                }
              }
            },
            // title: {
            // display: true,
            // text: 'Titre du graphe', // Chart Title
            // },
        },
      };

      const typesOfCharts = {
        'line': Line,
        'bar': Bar,
        'radar': Radar,
      }
      // @ts-ignore
      const RetainedChart = typesOfCharts[chartType]

      let data

      if (chartType == 'radar') {
        const labels = []
        const marketData = [] //fixe : aller chercher avec un loadFromDb
        const myData = []
        console.log(JSON.stringify(options,null,2));
        
        //parcourir donnée user et remplir labels, mydata et marketdata
        value?.forEach(v => {
          console.log('v',v);
          
        })

        //building of data
        const myDataset = {
          label: 'Mes résultats',
          data: myData,
          fill: false,
          order: 1
          //color ? (borderColor = pointBackgroundColor = pointHoverBackgroundColor = pointHoverBorderColor = 'rgb(xx, xx, xx', backgroundColor : 'rgba(xx,xx,xx, 0.2)')
        }

        const marketDataset = {
          label: 'Marché',
          data: marketData,
          fill: true,
          order: 2
          // color ? (borderColor = pointBackgroundColor = pointHoverBackgroundColor = pointHoverBorderColor = 'rgb(xx, xx, xx', backgroundColor : 'rgba(xx,xx,xx, 0.2)')
        }

        data = {
          labels: labels,
          datasets: [myDataset, marketDataset]
        }

      } else {

        const dateSeries=value?.some(v => !!v.date)
        const labels = value?.map(v => dateSeries ? moment(v.date).format('L') : v.x)

        const datasets=lodash.range(5).map(index => {
          const attribute=props[`series_${index}_attribute`]
          const series_data=value?.map(v => v.x ? ({x: v.x, y:v.y}) : ({x:moment(v.date).format('L'), y:v[attribute]}))
          const label=props[`series_${index}_label`]
          const color=props[`series_${index}_color`]
          if ((!dateSeries || attribute) && label) {
            return ({
              label,
              data: series_data,
              spanGaps: true,
              backgroundColor: color,
              borderColor: color,
              spanGaps: true,
            })
          }
          else {return null}
        })
        .filter(v => !!v)

        data = {
          labels,
          datasets
        };

      }
      console.log('retainedChart',RetainedChart);
      console.log('data', data);
      
      const FinalChart:TypedChartComponent<ChartType> = () => React.createElement(RetainedChart, {data, options})

  return (
    <Box id={id} {...props}>
      <FinalChart />
    </Box>
  )

}

export default OwnChart
