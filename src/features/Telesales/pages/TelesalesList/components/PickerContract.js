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
import { useRoles } from 'src/hooks/useRoles'
import moreApi from 'src/api/more.api'
import SelectStaffs from 'src/components/Selects/SelectStaffs'

moment.locale('vi')

const AddNotiSchema = Yup.object().shape({
  CreateDate: Yup.string().required('Ngày tạo trống'),
  EndDate: Yup.string().required('Ngày hết hạn trống')
})

const PickerPayed = ({
  children,
  List,
  item,
  index,
  rowData,
  onRefresh,
  setList
}) => {
  const [visible, setVisible] = useState(false)

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

  const onSubmit = values => {
    let newItem = {
      ...item,
      CreateDate: item.CreateDate
        ? moment(item.CreateDate).format('HH:mm YYYY-MM-DD')
        : ''
    }
    if (item?.Payments) {
      newItem.Payments.push(values)
    } else {
      newItem.Payments = [values]
    }

    let newList = [...List]

    newList[index] = newItem

    updateMutation.mutate(
      {
        ContractJSON: newList
      },
      {
        onSuccess: ({ lst }) => {
          onRefresh()
          setVisible(false)

          if (lst && lst.length > 0) {
            const ListsNews = lst[0].ContractJSON
              ? JSON.parse(lst[0].ContractJSON)
              : []
            setList(ListsNews)
          }
        }
      }
    )
  }

  return (
    <>
      {children({ open: () => setVisible(true) })}
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
                  Thanh toán
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Formik
            initialValues={{
              CreateDate: '',
              Price: '',
              RosePrice: '',
              SalesPayment: ''
            }}
            onSubmit={onSubmit}
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
                      gridTemplateColumns: 'repeat(1,minmax(0,1fr))',
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
                  </div>
                  <div className="form-group mb-15px">
                    <label>Số tiền</label>
                    <NumericFormat
                      className="form-control"
                      allowLeadingZeros={true}
                      thousandSeparator={true}
                      value={values.Price}
                      placeholder="Nhập giá trị"
                      onValueChange={val => {
                        setFieldValue('Price', val.floatValue || '', false)
                      }}
                    />
                  </div>
                  <div className="form-group mb-15px">
                    <label>Sale thanh toán</label>
                    <SelectStaffs
                      adv={true}
                      className="select-control"
                      menuPosition="fixed"
                      menuPlacement="top"
                      name="SalesPayment"
                      onChange={otp => {
                        setFieldValue('SalesPayment', otp, false)
                      }}
                      value={values.SalesPayment}
                      isClearable={true}
                    />
                  </div>
                  <div className="form-group mb-15px">
                    <label>Hoa hồng</label>
                    <NumericFormat
                      className="form-control"
                      allowLeadingZeros={true}
                      thousandSeparator={true}
                      value={values.RosePrice}
                      placeholder="Nhập giá trị"
                      onValueChange={val => {
                        setFieldValue('RosePrice', val.floatValue || '', false)
                      }}
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
                      disabled={updateMutation.isPending}
                    >
                      Thêm mới
                    </button>
                  </div>
                </Form>
              )
            }}
          </Formik>
        </Modal>,
        document.body
      )}
    </>
  )
}

function PickerContract({ children, rowData, onRefresh }) {
  const [visible, setVisible] = useState()
  const [List, setList] = useState(
    rowData?.ContractJSON ? JSON.parse(rowData?.ContractJSON) : []
  )

  const [activeKey, setActiveKey] = useState('list')

  const { ky_thuat, tele, nang_cao } = useRoles([
    'ky_thuat',
    'tele',
    'nang_cao'
  ])

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

  const onDeleteSub = (index, idx) => {
    let newLists = [...List]
    newLists[index].Payments.splice(idx, 1)
    Swal.fire({
      title: 'Thực hiện xóa ?',
      html: `Bạn đang thực hiện lần thanh toán này.`,
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'bg-danger'
      },
      preConfirm: () =>
        new Promise((resolve, reject) => {
          newLists[index].Payments.splice(idx, 1)
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

  const uploadMutation = useMutation({
    mutationFn: async body => {
      let { data } = await moreApi.uploadFile(body)
      return data
    }
  })

  const handleChangeFiles = (file, setFieldValue) => {
    var bodyFormData = new FormData()
    bodyFormData.append('file', file[0])
    uploadMutation.mutate(bodyFormData, {
      onSuccess: data => {
        setFieldValue('ContractFile', data.data)
      }
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
            {(tele?.hasRight || (!ky_thuat.hasRight && nang_cao.hasRight)) && (
              <Nav variant="pills" className="nav-contract">
                <Nav.Item>
                  <Nav.Link eventKey="list">Danh sách</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="add">Thêm mới</Nav.Link>
                </Nav.Item>
              </Nav>
            )}

            <Tab.Content className="flex-grow-1 overflow-auto">
              <Tab.Pane className="h-100" eventKey="list">
                {List && List.length > 0 && (
                  <div>
                    {List.map((item, index) => (
                      <div
                        className="p-15px border-bottom position-relative"
                        key={index}
                      >
                        {(tele?.hasRight ||
                          (!ky_thuat.hasRight && nang_cao.hasRight)) && (
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
                          Cơ sở :
                          <span className="pl-5px fw-600 text-danger">
                            {item?.CountStock || 1}
                          </span>
                        </div>
                        {item.ContractFile && (
                          <div>
                            Files hợp đồng :
                            <a
                              href={AssetsHelpers.toUrlServer(
                                `/upload/image/${item.ContractFile}`
                              )}
                              className="pl-5px fw-600 text-primary"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Xem file hợp đồng
                            </a>
                          </div>
                        )}

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

                        {item.Payments && item.Payments.length > 0 && (
                          <div className="border-top pt-10px mt-10px">
                            <div className="fw-600">Lịch sử thanh toán</div>
                            <div>
                              {item.Payments &&
                                item.Payments.map((item, idx) => (
                                  <div
                                    className="border mt-12px rounded p-12px position-relative"
                                    key={idx}
                                  >
                                    <div>
                                      Ngày :
                                      <span className="fw-600 pl-3px">
                                        {moment(item.CreateDate).format(
                                          'HH:mm DD-MM-YYYY'
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      Số tiền :
                                      <span className="fw-600 pl-3px">
                                        {PriceHelper.formatVND(item.Price)}
                                      </span>
                                    </div>
                                    <div>
                                      Hoa hồng :
                                      <span className="fw-600 pl-3px">
                                        {PriceHelper.formatVND(item.RosePrice)}
                                      </span>
                                    </div>
                                    <div>
                                      Sale thanh toán :
                                      <span className="fw-600 pl-3px">
                                        {item?.SalesPayment?.text}
                                      </span>
                                    </div>
                                    {(tele?.hasRight ||
                                      (!ky_thuat.hasRight &&
                                        nang_cao.hasRight)) && (
                                      <div
                                        className="text-danger border position-absolute bg-white right-20px top-20px w-40px h-40px d-flex justify-content-center align-items-center rounded-circle cursor-pointer"
                                        onClick={() => onDeleteSub(index, idx)}
                                      >
                                        <i className="far fa-trash-alt"></i>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        <PickerPayed
                          List={List}
                          item={item}
                          index={index}
                          rowData={rowData}
                          onRefresh={onRefresh}
                          setList={setList}
                        >
                          {({ open }) => (
                            <div className="mt-12px">
                              <button
                                type="button"
                                className="btn btn-success"
                                onClick={open}
                              >
                                Thanh toán
                              </button>
                            </div>
                          )}
                        </PickerPayed>
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
                    },
                    CountStock: '',
                    ContractFile: ''
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
                          <label>Số cơ sở</label>
                          <NumericFormat
                            className="form-control"
                            allowLeadingZeros={true}
                            //thousandSeparator={true}
                            value={values.CountStock}
                            placeholder="Nhập số cơ sở"
                            onValueChange={val => {
                              setFieldValue(
                                'CountStock',
                                val.floatValue || '',
                                false
                              )
                            }}
                          />
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
                        <div>
                          <div className="form-group mb-15px">
                            <label>File hợp đồng</label>
                            <div className="position-relative d-flex form-control p-0">
                              <div className="flex-1 d-flex align-items-center px-15px">
                                {uploadMutation.isPending &&
                                  'Đang tải file ...'}
                                {!uploadMutation.isPending && (
                                  <>
                                    {values?.ContractFile
                                      ? values?.ContractFile.split('/')[
                                          values?.ContractFile.split('/')
                                            .length - 1
                                        ]
                                      : 'Chọn file hợp đồng'}
                                  </>
                                )}
                              </div>
                              <div
                                className="d-flex align-items-center px-15px"
                                style={{
                                  background: '#e9ecef'
                                }}
                              >
                                Tải files
                              </div>
                              <input
                                className="position-absolute opacity-0 w-100 h-100"
                                type="file"
                                id="formFile"
                                onChange={event =>
                                  handleChangeFiles(
                                    event.target.files,
                                    setFieldValue
                                  )
                                }
                                multiple={false}
                                value=""
                                disabled={uploadMutation.isPending}
                              />
                            </div>
                          </div>
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
                            disabled={updateMutation.isPending}
                          >
                            Thêm mới
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
