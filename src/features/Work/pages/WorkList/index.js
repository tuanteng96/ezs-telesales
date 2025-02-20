import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import telesalesApi from 'src/api/telesales.api'
import ReactBaseTableInfinite from 'src/components/Tables/ReactBaseTableInfinite'
import Sidebar from './components/Sidebar'
import Navbar from 'src/components/Navbar/Navbar'

import moment from 'moment'
import 'moment/locale/vi'
import { useLocation } from 'react-router-dom'
import { useWindowSize } from 'src/hooks/useWindowSize'
import { WorkContext } from '../..'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { PriceHelper } from 'src/helpers/PriceHelper'

moment.locale('vi')

function checkGG(fn) {
  if (
    window.GC &&
    window.GC.Spread &&
    window.GC.Spread.Excel &&
    window.GC.Spread.Excel.IO
  ) {
    fn()
  } else {
    setTimeout(() => {
      checkGG(fn)
    }, 50)
  }
}

function WorkList(props) {
  const { CrStockID, teleAdv, User } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || '',
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false,
    User: auth?.Info?.User
  }))
  const [Lists, setLists] = useState([])
  const [loading, setLoading] = useState(false)
  const [PageCount, setPageCount] = useState(0)
  const [PageTotal, setPageTotal] = useState(0)
  const [IsLoadingEx, setIsLoadingEx] = useState(false)
  const [ListDate, setListDate] = useState([])

  const { pathname, state } = useLocation()

  const [filters, setFilters] = useState(
    state?.filters
      ? state?.filters
      : {
          filter: {
            from: moment().startOf('month').toDate(),
            to: moment().endOf('month').toDate(),
            status: 1
          },
          pi: 1,
          ps: 20
        }
  )

  const { width } = useWindowSize()

  const { onOpenSidebar } = useContext(WorkContext)

  useEffect(() => {
    getListStatistical()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListStatistical = callback => {
    setLoading(true)
    const newFilter = {
      ...filters,
      filter: {
        ...filters.filter,
        from: filters.filter.from
          ? moment(filters.filter.from).format('YYYY-MM-DD')
          : '',
        to: filters.filter.to
          ? moment(filters.filter.to).format('YYYY-MM-DD')
          : ''
      },
      pi: callback ? 1 : filters.pi
    }

    telesalesApi
      .getListWorkReport(newFilter)
      .then(({ data }) => {
        if (data.error) {
          setLoading(false)
          // Xử lí lỗi
        } else {
          const { List, PCount, Total } = {
            List: data?.items || [],
            Pcount: data?.pcount || 0,
            Total: data?.total || 0
          }
          if (filters.pi > 1 || !callback) {
            setLists(prevState => [
              ...prevState,
              ...List.map(x => ({ ...x, ID: x.Member.ID }))
            ])
          } else {
            setLists(List.map(x => ({ ...x, ID: x.Member.ID })))
          }
          if (filters.pi === 1 && List.length > 0) {
            setListDate(List[0].Dates.map(x => ({ Date: x.Date })))
          }
          setPageCount(PCount)
          setPageTotal(Total)
          setLoading(false)
          callback && callback()
        }
      })
      .catch(error => console.log(error))
  }

  const onRefresh = callback => {
    getListStatistical(() => {
      callback && callback()
    })
  }

  const columns = useMemo(
    () => {
      let newColumns = [
        {
          key: 'index',
          title: 'STT',
          dataKey: 'index',
          cellRenderer: ({ rowIndex }) => rowIndex + 1,
          width: 60,
          sortable: false,
          align: 'center',
          frozen: 'left'
        },
        {
          key: 'MemberName',
          title: 'Khách hàng',
          dataKey: 'MemberName',
          cellRenderer: ({ rowData }) => (
            <div>
              <div className="fw-600">{rowData?.Member.FullName}</div>
              <div className="font-number">{rowData?.Member.MobilePhone}</div>
              <div className="font-number">{rowData?.Member.SoftLink}</div>
            </div>
          ),
          width: 220,
          sortable: false,
          frozen: 'left'
        }
      ]
      if (ListDate && ListDate.length > 0) {
        for (const [i, value] of ListDate.entries()) {
          let clm = {
            key: value.Date,
            title: moment(value.Date).format('DD-MM-YYYY'),
            dataKey: value.Date,
            cellRenderer: ({ rowData }) => {
              if (!rowData.Dates[i].DICH_VU && !rowData.Dates[i].DON_HANG)
                return (
                  <div
                    className="w-100 h-100"
                    onClick={event => {
                      window.top.rowEventHandlers &&
                        window.top.rowEventHandlers({
                          event,
                          rowData,
                          rowItems: rowData.Dates[i],
                          onRefresh
                        })
                    }}
                  ></div>
                )
              if (rowData.Dates[i].DICH_VU || rowData.Dates[i].DON_HANG) {
                if (
                  rowData.Dates[i].DICH_VU?.HOAN_THANH ||
                  rowData.Dates[i].DON_HANG?.TONG_GIA_TRI ||
                  rowData.Dates[i].DON_HANG?.TONG_SO
                ) {
                  return (
                    <div className="w-100 h-100 px-3 d-flex align-items-center">
                      <OverlayTrigger
                        trigger="click"
                        placement="top"
                        overlay={
                          <Popover
                            id="popover-basic"
                            style={{ minWidth: '250px', width: '250px' }}
                          >
                            <Popover.Header as="h3">Thông tin</Popover.Header>
                            <Popover.Body className="border-0 p-0">
                              <div className="border-bottom py-8px px-12px d-flex justify-content-between">
                                <span>Dịch vụ hoàn thành</span>
                                <span className="fw-600">
                                  {rowData.Dates[i].DICH_VU?.HOAN_THANH}
                                </span>
                              </div>
                              <div className="border-bottom py-8px px-12px d-flex justify-content-between">
                                <span>Đơn hàng</span>
                                <span className="fw-600">
                                  {rowData.Dates[i].DON_HANG?.TONG_SO}
                                </span>
                              </div>
                              <div className="py-8px px-12px d-flex justify-content-between">
                                <span>Tổng giá trị</span>
                                <span className="fw-600">
                                  {PriceHelper.formatVND(
                                    rowData.Dates[i].DON_HANG?.TONG_GIA_TRI
                                  )}
                                </span>
                              </div>
                            </Popover.Body>
                            <div
                              className="py-8px px-12px"
                              onClick={event => {
                                window.top.rowEventHandlers &&
                                  window.top.rowEventHandlers({
                                    rowData,
                                    rowItems: rowData.Dates[i],
                                    onRefresh,
                                    event
                                  })
                              }}
                            >
                              <button
                                type="button"
                                className="btn btn-primary mr-5px"
                              >
                                <i className="fa-solid fa-rotate-right"></i>
                              </button>
                            </div>
                          </Popover>
                        }
                        rootClose
                      >
                        <div
                          className="w-100 h-40px"
                          style={{
                            backgroundColor: '#4e9c4e',
                            cursor: 'pointer'
                          }}
                        >
                          <span
                            style={{
                              color: 'white',
                              fontSize: '10px',
                              display: 'block',
                              padding: '2px 5px',
                              wordBreak: 'break-word'
                            }}
                          >
                            {rowData.Dates[i]?.Text}
                          </span>
                        </div>
                      </OverlayTrigger>
                    </div>
                  )
                } else {
                  return (
                    <div className="w-100 h-100 px-3 d-flex align-items-center">
                      <OverlayTrigger
                        trigger="click"
                        placement="top"
                        overlay={
                          <Popover
                            id="popover-basic"
                            style={{ minWidth: '250px', width: '250px' }}
                          >
                            <div className="py-8px px-12px">
                              <button
                                type="button"
                                className="btn btn-primary mr-5px"
                                onClick={event => {
                                  window.top.rowEventHandlers &&
                                    window.top.rowEventHandlers({
                                      rowData,
                                      rowItems: rowData.Dates[i],
                                      onRefresh,
                                      event
                                    })
                                }}
                              >
                                <i className="fa-solid fa-rotate-right"></i>
                              </button>
                            </div>
                          </Popover>
                        }
                        rootClose
                      >
                        <div
                          className="w-100 h-40px"
                          style={{
                            backgroundColor: '#f64e60',
                            cursor: 'pointer'
                          }}
                        >
                          <span
                            style={{
                              color: 'white',
                              fontSize: '12px',
                              display: 'block',
                              padding: '2px 5px'
                            }}
                          >
                            {rowData.Dates[i]?.Text}
                          </span>
                        </div>
                      </OverlayTrigger>
                    </div>
                  )
                }
              }
            },
            width: 110,
            sortable: false,
            className: ({ rowData }) =>
              moment(rowData.Dates[i].Date).format('DD-MM-YYYY') ===
              moment().format('DD-MM-YYYY')
                ? 'bg-light-waring p-0'
                : 'p-0',
            headerClassName: ({ column }) =>
              column.title === moment().format('DD-MM-YYYY')
                ? 'px-0 bg-light-waring'
                : 'px-0',
            headerRenderer: () => (
              <div
                className="w-100 h-100 d-flex justify-content-center align-items-center current-pointer"
                onClick={event => {
                  window.top.rowEventHandlers &&
                    window.top.rowHeaderHandlers({
                      CrDate: value.Date,
                      data: Lists || [],
                      event,
                      onRefresh
                    })
                }}
              >
                {moment(value.Date).format('DD-MM-YYYY')}
              </div>
            )
          }
          newColumns.push(clm)
        }
      }
      return newColumns
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, pathname, filters, ListDate]
  )

  const handleEndReached = () => {
    if (Lists.length < PageTotal) {
      setFilters(prevState => ({ ...prevState, pi: prevState.pi + 1 }))
    }
  }

  const onFilter = values => {
    setFilters(prevState => ({ ...prevState, ...values, pi: 1 }))
  }

  const ExportExcel = () => {
    setIsLoadingEx(true)
    checkGG(() => {
      const newFilter = {
        ...filters,
        filter: {
          ...filters.filter,
          from: filters.filter.from
            ? moment(filters.filter.from).format('YYYY-MM-DD')
            : '',
          to: filters.filter.to
            ? moment(filters.filter.to).format('YYYY-MM-DD')
            : ''
        },
        pi: 1,
        ps: PageTotal
      }

      telesalesApi.getListStatisticals(newFilter).then(({ data }) => {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: 'telesale-statistical',
            Data: {
              data: data,
              params: filters
            },
            hideLoading: () => setIsLoadingEx(false)
          })
      })
    })
  }

  return (
    <div className="d-flex h-100 telesales-list">
      <Sidebar
        filters={filters}
        loading={loading}
        onSubmit={onFilter}
        onRefresh={onRefresh}
      />
      <div className="telesales-list__content flex-fill px-15px px-lg-20px pb-15px pb-lg-20px d-flex flex-column">
        <div className="border-bottom py-10px fw-600 font-size-lg position-relative d-flex justify-content-between align-items-center">
          <div className="flex-1">
            <span className="text-uppercase">Hoạt động -</span>
            <span className="text-danger pl-3px">{PageTotal}</span>
            <span className="pl-5px font-label text-muted font-size-sm text-none">
              SPA
            </span>
          </div>
          <div className="w-85px w-md-auto d-flex">
            {/* <button
              type="button"
              className="btn btn-primary mr-5px"
              onClick={() =>
                window?.top?.ActivityGet && window?.top?.ActivityGet()
              }
            >
              <i className="fa-solid fa-rotate-right"></i>
            </button> */}
            <Navbar ExportExcel={ExportExcel} IsLoadingEx={IsLoadingEx} />
            <button
              type="button"
              className="btn btn-primary d-lg-none ml-5px"
              onClick={onOpenSidebar}
            >
              <i className="fa-solid fa-filters"></i>
            </button>
          </div>
        </div>
        <div className="flex-grow-1">
          <ReactBaseTableInfinite
            rowKey="ID"
            columns={columns}
            data={Lists}
            loading={loading}
            pageCount={PageCount}
            onEndReachedThreshold={300}
            onEndReached={handleEndReached}
            rowHeight={90}
            //onPagesChange={onPagesChange}
            //rowRenderer={rowRenderer}
          />
        </div>
      </div>
    </div>
  )
}

export default WorkList
