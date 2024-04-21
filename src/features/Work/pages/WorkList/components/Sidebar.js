import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Formik, Form } from 'formik'
import DatePicker, { registerLocale } from 'react-datepicker'
import clsx from 'clsx'
import { useSelector } from 'react-redux'

import vi from 'date-fns/locale/vi' // the locale you w
import { WorkContext } from 'src/features/Work'

registerLocale('vi', vi) // register it with the name you want

Sidebar.propTypes = {
  filters: PropTypes.object,
  onSubmit: PropTypes.func
}

function Sidebar({ filters, onSubmit, loading, onRefresh }) {
  const { isSidebar, onHideSidebar } = useContext(WorkContext)
  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))

  return (
    <>
      <div
        className={clsx(
          'telesales-list__sidebar bg-white',
          isSidebar && 'show'
        )}
      >
        <Formik
          initialValues={filters}
          onSubmit={onSubmit}
          enableReinitialize={true}
        >
          {formikProps => {
            // errors, touched, handleChange, handleBlur
            const { values, setFieldValue } = formikProps

            return (
              <Form className="d-flex flex-column h-100">
                <div className="border-bottom p-15px text-uppercase fw-600 font-size-lg position-relative">
                  Tìm kiếm
                </div>
                <div className="flex-grow-1 p-15px overflow-auto">
                  {/* <div className="mb-15px form-group">
                    <label className="font-label text-muted mb-5px">
                      Cơ sở
                    </label>
                    <SelectStocks
                      name="filter.StockID"
                      value={values?.filter?.StockID}
                      onChange={otp => {
                        setFieldValue('filter.StockID', otp ? otp.value : '')
                      }}
                    />
                  </div> */}
                  <div className="mb-15px form-group">
                    <label className="font-label text-muted mb-5px">
                      Thời gian từ
                    </label>
                    <div>
                      <DatePicker
                        calendarClassName="hide-header"
                        onChange={date => {
                          setFieldValue('filter.from', date, false)
                        }}
                        selected={values.filter.from}
                        placeholderText="Từ ngày"
                        className="form-control"
                        dateFormat="dd/MM/yyyy"
                        dateFormatCalendar="MMMM"
                      />
                    </div>
                  </div>
                  <div className="mb-15px form-group">
                    <label className="font-label text-muted mb-5px">
                      Thời gian từ
                    </label>
                    <div>
                      <DatePicker
                        onChange={date => {
                          setFieldValue('filter.to', date, false)
                        }}
                        selected={values.filter.to}
                        placeholderText="Đến ngày"
                        className="form-control"
                        dateFormat="dd/MM/yyyy"
                        dateFormatCalendar="MMMM"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-top p-15px d-flex">
                  <button
                    type="button"
                    className="btn btn-secondary h-42px mr-8px d-lg-none"
                    onClick={onHideSidebar}
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className={clsx(
                      'btn btn-primary w-100 text-uppercase fw-500 h-42px font-size-base flex-fill',
                      loading && 'spinner spinner-white spinner-right mr-3'
                    )}
                    disabled={loading}
                  >
                    Tìm kiếm khách hàng
                  </button>
                </div>
              </Form>
            )
          }}
        </Formik>
      </div>
      <div
        className={clsx('telesales-list__sidebar--bg', isSidebar && 'show')}
        onClick={onHideSidebar}
      ></div>
    </>
  )
}

export default Sidebar
