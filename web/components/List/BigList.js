import React from 'react';
import { AgGridReact } from 'ag-grid-react'
import {Typography} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import Paper from '@material-ui/core/Paper';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import Link from 'next/link';
import Grid from '@material-ui/core/Grid';
const {
  StatusCellRenderer, StatusCellFilter, DateCellRenderer,
  MangopayCellRenderer, PictureCellRenderer, LinkEdit }=require('../Render/models')

class BigList extends React.Component {

  constructor(props) {
    super(props)
  }

  render = () => {

    const {data, columnDefs, classes, title} = this.props

    const frameworkComponents={
      'statusCellRenderer': StatusCellRenderer,
      'dateCellRenderer': DateCellRenderer,
      'mangopayCellRenderer' : MangopayCellRenderer,
      'statusCellFilter' : StatusCellFilter,
      'pictureCellRenderer' : PictureCellRenderer,
      'linkEdit' : LinkEdit,
    }

    const defaultColDef={
      sortable: true,
      filter:true,
      resizable: true,
      filterParams: {
        buttons: ['reset', 'apply'],
      },
    }

    return (
      <>
        <Grid container className={classes.signupContainer}>
            <Grid item style={{display: 'flex', justifyContent: 'center'}}>
              <Typography style={{fontSize: 30}}>{title}</Typography>
            </Grid>
            <Paper style={{height: '600px', width: '100%'}} className={"ag-theme-balham"}>
              <AgGridReact rowData={data} columnDefs={columnDefs} enableSorting={true}
              enableFilter={true} pagination={true} defaultColDef={defaultColDef}
              frameworkComponents={frameworkComponents}
              {...this.props}
              localeText= {{noRowsToShow: 'Aucun résultat'}}
              />
            </Paper>
        </Grid>
      </>
    )
  }
}

module.exports = {BigList}
