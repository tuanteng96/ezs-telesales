import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Modal, Nav, Tab } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import telesalesApi from 'src/api/telesales.api'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import DatePicker from 'react-datepicker'
import Text from 'react-texty'
import moment from 'moment'
import 'moment/locale/vi'
import { Formik, Form } from 'formik'
import Select from 'react-select'
import { NumericFormat } from 'react-number-format'
import { useMutation } from '@tanstack/react-query'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { useSelector } from 'react-redux'

moment.locale('vi')

const AddNotiSchema = Yup.object().shape({
  CreateDate: Yup.string().required('Ngày tạo trống'),
  EndDate: Yup.string().required('Ngày hết hạn trống')
})

function PickerContract({ children, rowData, onRefresh }) {
  const [visible, setVisible] = useState()
  const [List, setList] = useState(
    rowData?.ContractJSON ? JSON.parse(rowData?.ContractJSON) : []
  )

  const [activeKey, setActiveKey] = useState('list')

  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))

  useEffect(() => {
    setList(rowData?.ContractJSON ? JSON.parse(rowData?.ContractJSON) : [])
  }, [rowData])

  const updateMutation = useMutation({
    mutationFn: async body => {
      const newData = {
        arr: [
          {
            ID: rowData.ID,
            ContractJSON: body?.ContractJSON
              ? JSON.stringify(body.ContractJSON)
              : ''
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
        : '',
      EndDate: values?.EndDate
        ? moment(values?.EndDate).format('HH:mm YYYY-MM-DD')
        : '',
      Type: values?.Type?.value || ''
    }
    let newLists = [newObject, ...List]
    updateMutation.mutate(
      {
        ContractJSON: newLists
      },
      {
        onSuccess: ({ lst }) => {
          onRefresh()
          if (lst && lst.length > 0) {
            const ListsNews = lst[0].ContractJSON
              ? JSON.parse(lst[0].ContractJSON)
              : []
            setList(ListsNews)
            resetForm()
            setActiveKey('list')
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
              ContractJSON: newLists
            },
            {
              onSuccess: ({ lst }) => {
                onRefresh()
                if (lst && lst.length > 0) {
                  const ListsNews = lst[0].ContractJSON
                    ? JSON.parse(lst[0].ContractJSON)
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

  return (
    <>
      <div className="cursor-pointer" onClick={() => setVisible(true)}>
        {List && List.length > 0 ? (
          <>
            <div className="mt-8px fw-500">
              Hạn sử dụng
              <span className="pl-5px text-danger">
                {moment(List[0].EndDate).format('DD-MM-YYYY')}
              </span>
            </div>
            <Text style={{ width: '230px' }} tooltipMaxWidth={250}>
              Nội dung :<span className="fw-500 pl-3px">{List[0].Content}</span>
            </Text>
          </>
        ) : (
          <div className="text-muted2">Thêm mới hợp đồng</div>
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
                  Hợp đồng
                </div>
                <div className="font-number font-size-base">
                  {rowData?.FullName} - {rowData.HandCardID} -{' '}
                  {rowData?.MobilePhone}
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Tab.Container activeKey={activeKey} onSelect={e => setActiveKey(e)}>
            <Nav variant="pills" className="nav-contract">
              <Nav.Item>
                <Nav.Link eventKey="list">Danh sách</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="add">Thêm mới</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content className="flex-grow-1 overflow-auto">
              <Tab.Pane className="h-100" eventKey="list">
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
                          Hạn sử dụng :
                          <span className="pl-5px fw-600 text-danger">
                            {moment(item.EndDate, 'HH:mm YYYY-MM-DD').format(
                              'DD-MM-YYYY'
                            )}
                          </span>
                        </div>
                        <div>
                          Loại :
                          <span className="pl-5px fw-600">
                            {item?.Type || 'Không'}
                          </span>
                        </div>
                        <div>
                          Giá trị :
                          <span className="pl-5px fw-600 text-danger">
                            {PriceHelper.formatVND(item?.Price)}
                          </span>
                        </div>
                        <div>
                          Nội dung :
                          <span className="pl-5px fw-500">
                            {item.Content || 'Không'}
                          </span>
                        </div>
                        <div>
                          Ghi chú :
                          <span className="pl-5px fw-500">
                            {item.Note || 'Không'}
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
                        Không có hợp đồng.
                      </div>
                    </div>
                  </div>
                )}
              </Tab.Pane>
              <Tab.Pane className="h-100" eventKey="add">
                <Formik
                  initialValues={{
                    CreateDate: '',
                    Content: '',
                    Price: '',
                    EndDate: '',
                    Note: '',
                    Type: {
                      label: 'Ký mới',
                      value: 'Ký mới'
                    }
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
                      <Form className="p-15px">
                        <div
                          className="mb-15px"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                            gap: '1rem'
                          }}
                        >
                          <div className="form-group mb-0">
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
                          <div className="form-group mb-0">
                            <label>Hạn dùng</label>
                            <DatePicker
                              name="EndDate"
                              onChange={date => {
                                setFieldValue('EndDate', date, false)
                              }}
                              selected={values.EndDate}
                              placeholderText="Chọn ngày"
                              className={`form-control ${
                                errors?.EndDate && touched?.EndDate
                                  ? 'is-invalid solid-invalid'
                                  : ''
                              }`}
                              dateFormat="dd/MM/yyyy"
                              onBlur={handleBlur}
                              autoComplete="off"
                              //dateFormatCalendar="MMMM"
                            />
                          </div>
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
                        <div className="form-group mb-15px">
                          <label>Giá trị</label>
                          <NumericFormat
                            className="form-control"
                            allowLeadingZeros={true}
                            thousandSeparator={true}
                            value={values.Price}
                            placeholder="Nhập giá trị"
                            onValueChange={val => {
                              setFieldValue(
                                'Price',
                                val.floatValue || '',
                                false
                              )
                            }}
                          />
                        </div>
                        <div className="form-group mb-15px">
                          <label>Ghi chú</label>
                          <textarea
                            name="Note"
                            className={`form-control`}
                            rows="2"
                            value={values?.Note}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          ></textarea>
                        </div>
                        <div className="form-group mb-15px">
                          <label>Loại</label>
                          <Select
                            className="select-control"
                            classNamePrefix="select"
                            placeholder="Chọn loại"
                            menuPosition="fixed"
                            name="Type"
                            //menuIsOpen={true}
                            onChange={otp => {
                              setFieldValue('Type', otp, false)
                            }}
                            value={values.Type}
                            //isClearable={true}
                            options={[
                              {
                                label: 'Gia hạn',
                                value: 'Gia hạn'
                              },
                              {
                                label: 'Ký mới',
                                value: 'Ký mới'
                              }
                            ]}
                          />
                        </div>
                        <div>
                          <button
                            type="submit"
                            className={clsx(
                              'btn btn-success w-100',
                              updateMutation.isPending &&
                                'spinner spinner-white spinner-right'
                            )}
                            disabled={!teleAdv || updateMutation.isPending}
                          >
                            {teleAdv ? 'Thêm mới' : 'Không có quyền'}
                          </button>
                        </div>
                      </Form>
                    )
                  }}
                </Formik>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
          {/* <div>
            
          </div>
          <PerfectScrollbar
            options={perfectScrollbarOptions}
            className="scroll flex-grow-1 p-15px"
            style={{ position: 'relative' }}
          >
            {loading &&
              Array(1)
                .fill()
                .map((item, index) => (
                  <div
                    className={clsx(
                      'bg-light rounded-sm p-15px',
                      1 - 1 !== index && 'mb-12px'
                    )}
                    key={index}
                  >
                    <div className="d-flex justify-content-between">
                      <span className="font-number fw-500">
                        <Skeleton count={1} width={130} height={15} />
                      </span>
                      <span className="fw-500">
                        <Skeleton count={1} width={80} height={15} />
                      </span>
                    </div>
                    <div className="mt-5px fw-300">
                      <Skeleton count={3} height={15} />
                    </div>
                  </div>
                ))}
            {!loading && (
              <>
                {List && List.length > 0 ? (
                  List.map((item, index) => (
                    <div
                      className={clsx(
                        'bg-light rounded-sm p-15px',
                        List.length - 1 !== index && 'mb-12px'
                      )}
                      key={index}
                    >
                      <div className="d-flex justify-content-between">
                        <span className="font-number fw-500">
                          {moment(item.CreateDate).format('HH:mm DD-MM-YYYY')}
                        </span>
                        <div>
                          <OverlayComponent
                            onSubmit={onSubmit}
                            btnLoading={btnLoading}
                            Button={() =>
                              teleAdv && (
                                <span
                                  className="fw-500 text-success cursor-pointer text-underline font-size-sm mr-8px"
                                  //onClick={() => onDelete(item)}
                                >
                                  Sửa
                                </span>
                              )
                            }
                            item={item}
                            MemberID={MemberID}
                          />
                          {(teleAdv ||
                            moment(item.CreateDate).format('DD-MM-YYYY') ===
                              moment().format('DD-MM-YYYY')) && (
                            <span
                              className="fw-500 text-danger cursor-pointer text-underline font-size-sm"
                              onClick={() => onDelete(item)}
                            >
                              Xóa
                            </span>
                          )}
                        </div>
                      </div>
                      {item.Date && (
                        <div className="mt-8px fw-500">
                          Ngày nhắc
                          <span className="pl-5px">
                            {moment(item.Date).format('DD-MM-YYYY')}
                          </span>
                          {item.IsNoti && (
                            <span className="pl-5px font-size-xs text-success">
                              - Đã nhắc
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-5px fw-300">
                        Nội dung : <span className="fw-500">{item.Desc}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-100 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <img
                        className="w-100 max-w-120px"
                        src={AssetsHelpers.toAbsoluteUrl(
                          '/_assets/images/data-empty.png'
                        )}
                        alt="Không có dữ liệu"
                      />
                      <div className="text-center font-size-base fw-300">
                        Không có lịch sử chăm sóc.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </PerfectScrollbar> */}
        </Modal>,
        document.body
      )}
    </>
  )
}

export default PickerContract
