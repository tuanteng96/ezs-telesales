import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import telesalesApi from 'src/api/telesales.api'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import 'moment/locale/vi'
import { Formik, Form } from 'formik'
import { NumericFormat } from 'react-number-format'
import { useMutation } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

moment.locale('vi')

const AddNotiSchema = Yup.object().shape({
  CreateDate: Yup.string().required('Ngày tạo trống')
})

function PickerPoint({ children, rowData, onRefresh }) {
  const [visible, setVisible] = useState()
  const [List, setList] = useState(
    rowData?.PointJSON ? JSON.parse(rowData?.PointJSON) : []
  )

  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))

  useEffect(() => {
    setList(rowData?.PointJSON ? JSON.parse(rowData?.PointJSON) : [])
  }, [rowData])

  const updateMutation = useMutation({
    mutationFn: async body => {
      const newData = {
        arr: [
          {
            ID: rowData.ID,
            PointJSON: body?.PointJSON ? JSON.stringify(body.PointJSON) : ''
          }
        ]
      }
      let { data } = await telesalesApi.updateMemberIDTelesales(newData)

      return data
    }
  })

  const onSubmit = (values, { resetForm }) => {
    let newObject = {
      ...values,
      CreateDate: values?.CreateDate
        ? moment(values?.CreateDate).format('HH:mm YYYY-MM-DD')
        : ''
    }
    let newLists = [newObject, ...List]
    updateMutation.mutate(
      {
        PointJSON: newLists
      },
      {
        onSuccess: ({ lst }) => {
          onRefresh()
          if (lst && lst.length > 0) {
            const ListsNews = lst[0].PointJSON
              ? JSON.parse(lst[0].PointJSON)
              : []
            setList(ListsNews)
            resetForm()
          }
        }
      }
    )
  }

  const onDelete = index => {
    Swal.fire({
      title: 'Thực hiện xóa ?',
      html: `Bạn đang thực hiện xóa hợp đồng này.`,
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'bg-danger'
      },
      preConfirm: () =>
        new Promise((resolve, reject) => {
          let newLists = [...List]
          newLists.splice(index, 1)
          updateMutation.mutate(
            {
              PointJSON: newLists
            },
            {
              onSuccess: ({ lst }) => {
                onRefresh()
                if (lst && lst.length > 0) {
                  const ListsNews = lst[0].PointJSON
                    ? JSON.parse(lst[0].PointJSON)
                    : []
                  setList(ListsNews)
                  resolve()
                }
              }
            }
          )
        }),
      allowOutsideClick: () => !Swal.isLoading()
    })
  }

  const getTotalPoint = items => {
    return items
      .map(x => Number(x.Point))
      .reduce((partialSum, a) => partialSum + a, 0)
  }

  return (
    <>
      <div className="cursor-pointer" onClick={() => setVisible(true)}>
        {List && List.length > 0 ? (
          <>
            <div className="fw-600 text-success">
              {getTotalPoint(List)} điểm
            </div>
          </>
        ) : (
          <div className="text-muted2">Thêm mới tích điểm</div>
        )}
      </div>

      {createPortal(
        <Modal
          show={visible}
          onHide={() => setVisible(false)}
          dialogClassName="modal-content-right max-w-400px"
          scrollable={true}
          enforceFocus={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <div>
                <div className="fw-600 font-size-lg text-uppercase">
                  Tích điểm
                </div>
                <div className="font-number font-size-base">
                  {rowData?.FullName} - {rowData.HandCardID} -{' '}
                  {rowData?.MobilePhone}
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          {teleAdv && (
            <Formik
              initialValues={{
                CreateDate: '',
                Content: '',
                Point: ''
              }}
              onSubmit={onSubmit}
              validationSchema={AddNotiSchema}
              enableReinitialize={true}
            >
              {formikProps => {
                const {
                  values,
                  touched,
                  errors,
                  setFieldValue,
                  handleBlur,
                  handleChange
                } = formikProps
                return (
                  <Form className="p-15px border-bottom">
                    <div className="form-group mb-15px">
                      <label>Ngày</label>
                      <DatePicker
                        name="CreateDate"
                        onChange={date => {
                          setFieldValue('CreateDate', date, false)
                        }}
                        selected={values.CreateDate}
                        placeholderText="Chọn ngày"
                        className={`form-control ${
                          errors?.CreateDate && touched?.CreateDate
                            ? 'is-invalid solid-invalid'
                            : ''
                        }`}
                        dateFormat="dd/MM/yyyy"
                        onBlur={handleBlur}
                        autoComplete="off"
                        //dateFormatCalendar="MMMM"
                      />
                    </div>
                    <div className="form-group mb-15px">
                      <label>Số điểm</label>
                      <NumericFormat
                        className="form-control"
                        //allowLeadingZeros={true}
                        //thousandSeparator={true}
                        value={values.Point}
                        placeholder="Nhập số điểm"
                        onValueChange={val => {
                          setFieldValue('Point', val.floatValue || '', false)
                        }}
                      />
                    </div>
                    <div className="form-group mb-15px">
                      <label>Nội dung</label>
                      <textarea
                        name="Content"
                        className={`form-control ${
                          errors?.Content && touched?.Content
                            ? 'is-invalid solid-invalid'
                            : ''
                        }`}
                        rows="2"
                        value={values?.Content}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      ></textarea>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className={clsx(
                          'btn btn-success w-100',
                          updateMutation.isPending &&
                            'spinner spinner-white spinner-right'
                        )}
                        disabled={updateMutation.isPending}
                      >
                        Thêm mới
                      </button>
                    </div>
                  </Form>
                )
              }}
            </Formik>
          )}

          <div className="flex-grow-1 overflow-auto">
            {List && List.length > 0 && (
              <div>
                {List.map((item, index) => (
                  <div
                    className="p-15px border-bottom position-relative"
                    key={index}
                  >
                    {teleAdv && (
                      <div
                        className="text-danger shadow position-absolute bg-white right-20px top-20px w-40px h-40px d-flex justify-content-center align-items-center rounded-circle cursor-pointer"
                        onClick={() => onDelete(index)}
                      >
                        <i className="far fa-trash-alt"></i>
                      </div>
                    )}

                    <div>
                      Ngày tạo :
                      <span className="pl-5px fw-600">
                        {moment(item.CreateDate, 'HH:mm YYYY-MM-DD').format(
                          'DD-MM-YYYY'
                        )}
                      </span>
                    </div>
                    <div>
                      Số Điểm :
                      <span className="pl-5px fw-600 text-danger">
                        {item?.Point}
                      </span>
                    </div>
                    <div>
                      Nội dung :
                      <span className="pl-5px fw-500">
                        {item.Content || 'Không'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!List || List.length === 0) && (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <img
                    className="w-100 max-w-120px"
                    src={AssetsHelpers.toAbsoluteUrl(
                      '/_assets/images/data-empty.png'
                    )}
                    alt="Không có dữ liệu"
                  />
                  <div className="text-center font-size-base fw-300">
                    Không có tích điểm.
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>,
        document.body
      )}
    </>
  )
}

export default PickerPoint
