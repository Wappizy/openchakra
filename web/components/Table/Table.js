import React, {useMemo} from 'react'
import {useTable, useSortBy, useFilters, useGlobalFilter, usePagination} from 'react-table'
import {GlobalFilter} from './TableFilter'
import {fuzzyTextFilterFn} from './table-helper'
import TableDialogFilter from './TableDialogFilter'

const PaginationButtons = ({
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize,
  pageIndex,
  pageSize,
}) => {

  return (
    <div className="pagination">
      <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} title={'Première page'}>
        {'<<'}
      </button>{' '}
      <button onClick={() => previousPage()} disabled={!canPreviousPage} title={'Page précédente'}>
        {'<'}
      </button>{' '}
      <button onClick={() => nextPage()} disabled={!canNextPage} title={'Page suivante'}>
        {'>'}
      </button>{' '}
      <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} title={'Dernière page'}>
        {'>>'}
      </button>{' '}
      <span>
          Page{' '}
        <strong>
          {pageIndex + 1} sur {pageOptions.length}
        </strong>{' '}
      </span>
      <span>
          | Aller à la page:{' '}
        <input
          type="number"
          defaultValue={pageIndex + 1}
          onChange={e => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0
            gotoPage(page)
          }}
        />
      </span>{' '}
      <select
        value={pageSize}
        onChange={e => {
          setPageSize(Number(e.target.value))
        }}
      >
        {[10, 20, 30, 40, 50].map(pageSize => (
          <option key={pageSize} value={pageSize}>
            {pageSize} lignes
          </option>
        ))}
      </select>
    </div>
  )
}


function DefaultColumnFilter({
  column: {filterValue, preFilteredRows, setFilter},
}) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Rechercher dans les ${count} lignes`}
    />
  )
}

function dateBetweenFilterFn(rows, id, filterValues) {
  const sd = filterValues[0] ? new Date(filterValues[0]) : undefined
  const ed = filterValues[1] ? new Date(filterValues[1]) : undefined

  if (ed || sd) {
    return rows.filter(r => {
      const cellDate = new Date(r.values[id])

      if (ed && sd) {
        return cellDate >= sd && cellDate <= ed
      }
      else if (sd) {
        return cellDate >= sd
      }
      else if (ed) {
        return cellDate <= ed
      }
    })
  }
  return rows

}

dateBetweenFilterFn.autoRemove = val => !val


const Table = (
  {
    data,
    columns,
    caption = null,
    footer = null,
    updateMyData = null,
    globalfilter=null,
    filtered=false,
    pagination=false,
  },
) => {

  const filterTypes = useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      dateBetween: dateBetweenFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
              .toLowerCase()
              .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
    }),
    [],
  )

  const defaultColumn = useMemo(
    () => ({
      // default Filter UI
      Filter: DefaultColumnFilter,
    }),
    [],
  )

  const cols=useMemo(() => columns.map(c => ({...c, Header: c.label, accessor: c.attribute})), [columns])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: {pageIndex, pageSize},
  } = useTable(
    {
      columns: cols,
      data,
      defaultColumn,
      filterTypes,
      visibleColumns: [],
      updateMyData,
    },
    filtered && useFilters,
    useGlobalFilter,
    useSortBy,
    pagination && usePagination,
  )
  

  return (
    <>
      {globalfilter ?
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        : null
      }
      <table {...getTableProps()}>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header') !== '' &&
                    <div className='header'>
                      <button {...{...column.getHeaderProps(column.getSortByToggleProps()), 'aria-label': `tri ${column.isSorted &&(
                        column.isSortedDesc
                          ? 'décroissant'
                          : 'croissant') || ': non trié' }`, title: null}} >
                        {column.render('Header')}
                        {column.isSorted &&(
                          column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼')
                        }
                      </button>
                      {column.canFilter &&
                        <>
                          <TableDialogFilter>
                            {column.render('Filter')}
                          </TableDialogFilter>
                        </>
                      }

                      {column.filterValue &&
                        <div>{column.filterValue}  <button onClick={() => column.setFilter(undefined)}>
                           Supprimer ce filtre
                        </button>
                        </div>}
                    </div>
                  }
                </th>
              ))}
            </tr>
          ))}

        </thead>
        <tbody {...getTableBodyProps()}>
          {pagination ?
            page.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  })}
                </tr>
              )
            })
            :
            rows.map(row => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  })}
                </tr>
              )
            })
          }
        </tbody>
        {footer ?
          <tfoot>
            {footerGroups.map(group => (
              <tr {...group.getFooterGroupProps()}>
                {group.headers.map(column => (
                  <td {...column.getFooterProps()}>{column.render('Footer')}</td>
                ))}
              </tr>
            ))}
          </tfoot>
          : null}
      </table>

      {pagination && <PaginationButtons {...{
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        pageIndex,
        pageSize,
      }} />}
    </>
  )
}

export default Table
