import { useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { Form, Formik } from 'formik'
import React, { useEffect, useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import telesalesApi from 'src/api/telesales.api'
import ReactBaseTableInfinite from 'src/components/Tables/ReactBaseTableInfinite'
import Swal from 'sweetalert2'

const PickerPartnerAdd = ({
  children,
  Lists,
  rowData,
  MemberID,
  onRefresh,
  setLists
}) => {
  const [visible, setVisible] = useState()
  const [initialValues, setInitialValues] = useState({
    ID: -1,
    Status: false,
    FullName: '',
    Phone: '',
    Spa: '',
    Desc: ''
  })

  useEffect(() => {
    if (rowData) {
      setInitialValues(rowData)
    }
  }, [rowData])

  const updateMutation = useMutation({
    mutationFn: async body => {
      let { data } = await telesalesApi.updateUserPartner(body)
      await new Promise(resolve => {
        onRefresh(() => resolve())
      })
      return data
    }
  })

  const onSubmit = values => {
    let newValues = [...Lists]

    if (values?.ID > -1) {
      let index = newValues.findIndex(x => x.ID === values?.ID)
      if (index > -1) {
        newValues[index] = values
      }
    } else {
      newValues.push(values)
    }

    let dataPost = {
      MemberID: MemberID,
      UserPartnerID: -1,
      PartnerList: newValues
    }

    updateMutation.mutate(dataPost, {
      onSuccess: data => {
        setVisible(false)
        if (data?.UpdateList) {
          setLists(data?.UpdateList)
        }
      }
    })
  }

  return (
    <>
      {children({
        open: () => setVisible(true)
      })}
      {createPortal(
        <Modal
          show={visible}
          onHide={() => setVisible(false)}
          scrollable={true}
          enforceFocus={false}
          contentClassName="d-flex flex-column"
          dialogClassName="max-w-400px"
          backdropClassName="z-1055"
        >
          <Formik
            initialValues={initialValues}
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
                <Form className="h-100">
                  <Modal.Header closeButton>
                    <Modal.Title>
                      <div className="fw-600 font-size-lg text-uppercase">
                        Thêm mới nhân viên
                      </div>
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="form-group mb-15px">
                      <label>Họ và tên</label>
                      <input
                        name="FullName"
                        className="form-control"
                        value={values?.FullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nhập họ tên"
                      />
                    </div>
                    <div className="form-group mb-15px">
                      <label>Số điện thoại</label>
                      <input
                        name="Phone"
                        className="form-control"
                        value={values?.Phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Số điện thoại"
                      />
                    </div>
                    <div className="form-group mb-15px">
                      <label>Spa</label>
                      <input
                        name="Spa"
                        className="form-control"
                        value={values?.Spa}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Spa"
                      />
                    </div>
                    <div className="form-group mb-15px">
                      <label>Ghi chú</label>
                      <textarea
                        name="Desc"
                        className="form-control"
                        rows="3"
                        value={values?.Desc}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nhập ghi chú"
                      ></textarea>
                    </div>
                    <div>
                      <label className="cursor-pointer checkbox d-flex mt-20px">
                        <input
                          type="checkbox"
                          name="Status"
                          value={values.Status}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.Status}
                        />
                        <span className="checkbox-icon"></span>
                        <span className="fw-500 font-label">Đã tiếp cận</span>
                      </label>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <button
                      type="submit"
                      className={clsx(
                        'btn btn-primary',
                        updateMutation.isPending &&
                          'spinner spinner-white spinner-right'
                      )}
                      disabled={updateMutation.isPending}
                    >
                      Thêm mới
                    </button>
                  </Modal.Footer>
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

function PickerPartner({ children, rowData, onRefresh }) {
  const [visible, setVisible] = useState()
  const [Lists, setLists] = useState([])

  let MemberID = rowData?.ID

  useEffect(() => {
    if (visible) {
      if (rowData?.PartnerJSON) {
        setLists(JSON.parse(rowData?.PartnerJSON))
      } else {
        setLists([])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const deleteMutation = useMutation({
    mutationFn: async body => {
      let { data } = await telesalesApi.updateUserPartner(body)
      await new Promise(resolve => {
        onRefresh(() => resolve())
      })
      return data
    }
  })

  const onDelete = item => {
    let newValues = [...Lists]
    newValues = newValues.filter(x => x.ID !== item.ID)

    let dataPost = {
      MemberID: MemberID,
      UserPartnerID: -1,
      PartnerList: newValues
    }

    Swal.fire({
      title: 'Thực hiện xóa ?',
      html: `Bạn đang thực hiện xóa nhân viên này.`,
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'bg-danger'
      },
      preConfirm: () =>
        new Promise((resolve, reject) => {
          deleteMutation.mutate(dataPost, {
            onSuccess: (data) => {
              setLists(data?.UpdateList)
              resolve()
            }
          })
        }),
      allowOutsideClick: () => !Swal.isLoading()
    })
  }

  const columns = useMemo(
    () => [
      {
        key: 'FullName',
        title: 'Họ và tên',
        dataKey: 'FullName',
        width: 220,
        sortable: false
      },
      {
        key: 'Phone',
        title: 'Số điện thoại',
        dataKey: 'Phone',
        width: 150,
        sortable: false
      },
      {
        key: 'Spa',
        title: 'Spa',
        dataKey: 'Spa',
        width: 220,
        sortable: false
      },
      {
        key: 'Status',
        title: 'Trạng thái',
        dataKey: 'Status',
        width: 180,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div>{rowData?.Status ? 'Đã tiếp cận' : ''}</div>
        )
      },
      {
        key: 'Desc',
        title: 'Ghi chú',
        dataKey: 'Desc',
        width: 250,
        sortable: false
      },
      {
        key: 'action',
        title: '#',
        dataKey: 'action',
        width: 130,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div className="w-100 d-flex justify-content-center">
            <PickerPartnerAdd
              rowData={rowData}
              Lists={Lists}
              MemberID={MemberID}
              setLists={setLists}
              onRefresh={onRefresh}
            >
              {({ open }) => (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={open}
                >
                  <i className="fas fa-pencil-alt"></i>
                </button>
              )}
            </PickerPartnerAdd>
            <button
              type="button"
              className="btn btn-danger ml-8px"
              onClick={() => onDelete(rowData)}
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        ),
        headerClassName: 'justify-content-center',
        frozen: 'right'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Lists]
  )

  return (
    <>
      {children({
        open: () => setVisible(true)
      })}
      {createPortal(
        <Modal
          show={visible}
          onHide={() => setVisible(false)}
          dialogClassName="modal-content-right max-w-80"
          scrollable={true}
          enforceFocus={false}
          contentClassName="d-flex flex-column"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <div className="d-flex">
                <div>
                  <div className="fw-600 font-size-lg text-uppercase">
                    Danh sách nhân viên
                  </div>
                  <div className="font-number font-size-base">0 nhân viên</div>
                </div>
                <div className="pl-20px">
                  <PickerPartnerAdd
                    Lists={Lists}
                    MemberID={MemberID}
                    setLists={setLists}
                    onRefresh={onRefresh}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={open}
                      >
                        Thêm mới
                      </button>
                    )}
                  </PickerPartnerAdd>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <div className="flex-grow-1 p-15px">
            <ReactBaseTableInfinite
              rowKey="ID"
              columns={columns}
              data={Lists}
              loading={false}
              pageCount={1}
              onEndReachedThreshold={300}
              rowHeight={60}
              //onScroll={() => document.body.click()}
            />
          </div>
        </Modal>,
        document.body
      )}
    </>
  )
}

PickerPartner.propTypes = {}

export default PickerPartner
