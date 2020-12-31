import React from 'react';
import Grid from '@material-ui/core/Grid';

function withGrid(WrappedComponent) {

  return class extends React.Component{
    constructor(props) {
      super(props);
    }

    render(){
      const {style, model, page} = this.props;

      const colSize=12/model.getColumns();

      const indexes=[...Array(model.getRows()*model.getColumns())].map((v, idx) => idx);

      return(
        <Grid container spacing={2} style={{margin: 0, width: '100%'}}>
          { indexes.map((idx, index) => {
            const row=Math.floor(idx/model.getColumns());
            const col=idx%model.getColumns();
            const item=model.getData(page, col, row);

            return(
              <Grid key={index} item xl={colSize} lg={colSize} md={colSize} sm={colSize} xs={colSize} className={style.categoryCardRoot}>
                <WrappedComponent {...this.props} item={item} key={[page, col, row]}/>
              </Grid>
            )
            })
          }
        </Grid>
      )
    }
  }
}

export default withGrid
