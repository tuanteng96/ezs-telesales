import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import telesalesApi from 'src/api/telesales.api'
import ReactBaseTableInfinite from 'src/components/Tables/ReactBaseTableInfinite'
import Sidebar from './components/Sidebar'
import { Dropdown, Overlay } from 'react-bootstrap'
import SelectStaffs from 'src/components/Selects/SelectStaffs'
import { TelesalesContext } from '../..'
import { useWindowSize } from 'src/hooks/useWindowSize'
import Text from 'react-texty'
import ReminderCalendar from './components/ReminderCalendar'
import Navbar from 'src/components/Navbar/Navbar'
import Select from 'react-select'

import moment from 'moment'
import 'moment/locale/vi'
import { setFiltersTeles } from '../../TelesalesSlice'
import PickerHistory from './components/PickerHistory'
import PickerReminder from './components/PickerReminder'
import PickerStatus from './components/PickerStatus'
import { useMutation } from '@tanstack/react-query'
import moreApi from 'src/api/more.api'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'
import Swal from 'sweetalert2'
import PickerContract from './components/PickerContract'
import PickerPoint from './components/PickerPoint'
import clsx from 'clsx'

moment.locale('vi')

const EditableCell = ({ rowData, container, showEditing, hideEditing }) => {
  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))
  const [Editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [value, setValue] = useState(
    rowData?.TeleUser?.ID > 0
      ? { label: rowData?.TeleUser?.FullName, value: rowData?.TeleUser?.ID }
      : null
  )
  const target = useRef(null)

  useEffect(() => {
    setValue(
      rowData?.TeleUser?.ID > 0
        ? { label: rowData?.TeleUser?.FullName, value: rowData?.TeleUser?.ID }
        : null
    )
  }, [rowData?.TeleUser])

  const handleClick = () => {
    if (!teleAdv) return
    setEditing(true)
    showEditing()
  }

  const handleHide = () => {
    setEditing(false)
    hideEditing()
  }

  const onSubmit = options => {
    setLoading(true)
    const newData = {
      items: [
        {
          MemberID: rowData.ID,
          TeleUserID: options ? options.value : null
        }
      ]
    }
    telesalesApi
      .setUserIDTelesales(newData)
      .then(response => {
        setValue(options)
        setLoading(false)
      })
      .catch(error => console.log(error))
  }

  return (
    <div
      className="h-100 d-flex align-items-center cursor-pointer"
      ref={target}
      onClick={() => handleClick()}
    >
      {!Editing && (
        <>
          {value ? (
            <span className="fw-500">{value.label}</span>
          ) : (
            <span className="text-muted">Chọn nhân viên</span>
          )}
          {teleAdv && (
            <i className="fa-solid fa-user-pen pl-8px font-size-base text-muted"></i>
          )}
        </>
      )}
      {Editing && target && (
        <Overlay
          target={target.current}
          show={Editing}
          placement="right"
          //container={container}
          onHide={handleHide}
          rootClose
        >
          {({ placement, arrowProps, show: _show, popper, ...props }) => (
            <div
              {...props}
              style={{
                position: 'absolute',
                width: 190,
                ...props.style
              }}
            >
              <SelectStaffs
                isLoading={loading}
                className="select-control"
                //menuPosition="fixed"
                name="filter.tele_user_id"
                //menuIsOpen={true}
                onChange={otp => {
                  onSubmit(otp)
                }}
                value={value}
                isClearable={true}
                adv={true}
              />
            </div>
          )}
        </Overlay>
      )}
    </div>
  )
}

const EditableCellSupport = ({
  rowData,
  container,
  showEditing,
  hideEditing
}) => {
  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))
  const [Editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [value, setValue] = useState(
    rowData?.UserSupport
      ? {
          label: rowData?.UserSupport?.FullName,
          value: rowData?.UserSupport?.ID
        }
      : null
  )
  const target = useRef(null)

  useEffect(() => {
    setValue(
      rowData?.UserSupport
        ? {
            label: rowData?.UserSupport?.FullName,
            value: rowData?.UserSupport?.ID
          }
        : null
    )
  }, [rowData?.UserSupport])

  const handleClick = () => {
    if (!teleAdv) return
    setEditing(true)
    showEditing()
  }

  const handleHide = () => {
    setEditing(false)
    hideEditing()
  }

  const onSubmit = options => {
    setLoading(true)
    const newData = {
      arr: [
        {
          ID: rowData.ID,
          UserSupportID: options ? options.value : null
        }
      ]
    }
    telesalesApi
      .updateMemberIDTelesales(newData)
      .then(response => {
        setValue(options)
        setLoading(false)
      })
      .catch(error => console.log(error))
  }

  return (
    <div
      className="h-100 d-flex align-items-center cursor-pointer"
      ref={target}
      onClick={() => handleClick()}
    >
      {!Editing && (
        <>
          {value ? (
            <span className="fw-500">{value.label}</span>
          ) : (
            <span className="text-muted2">Chọn Support</span>
          )}
          {teleAdv && (
            <i className="fa-solid fa-user-pen pl-8px font-size-base text-muted"></i>
          )}
        </>
      )}
      {Editing && target && (
        <Overlay
          target={target.current}
          show={Editing}
          placement="right"
          //container={container}
          onHide={handleHide}
          rootClose
        >
          {({ placement, arrowProps, show: _show, popper, ...props }) => (
            <div
              {...props}
              style={{
                position: 'absolute',
                width: 190,
                ...props.style
              }}
            >
              <SelectStaffs
                classNamePrefix="select"
                isLoading={loading}
                className="select-control"
                //menuPosition="fixed"
                name="UserSupportID"
                //menuIsOpen={true}
                onChange={otp => {
                  onSubmit(otp)
                }}
                value={value}
                isClearable={true}
                adv={true}
              />
            </div>
          )}
        </Overlay>
      )}
    </div>
  )
}

const EditableCellType = ({ rowData, container, showEditing, hideEditing }) => {
  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))
  const [Editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [value, setValue] = useState(
    rowData?.Type
      ? {
          label: rowData?.Type,
          value: rowData?.Type
        }
      : null
  )
  const target = useRef(null)

  useEffect(() => {
    setValue(
      rowData?.Type
        ? {
            label: rowData?.Type,
            value: rowData?.Type
          }
        : null
    )
  }, [rowData?.Type])

  const handleClick = () => {
    if (!teleAdv) return
    setEditing(true)
    showEditing()
  }

  const handleHide = () => {
    setEditing(false)
    hideEditing()
  }

  const onSubmit = options => {
    setLoading(true)
    const newData = {
      arr: [
        {
          ID: rowData.ID,
          Type: options ? options.value : ''
        }
      ]
    }
    telesalesApi
      .updateMemberIDTelesales(newData)
      .then(response => {
        setValue(options)
        setLoading(false)
      })
      .catch(error => console.log(error))
  }

  return (
    <div
      className="h-100 d-flex align-items-center cursor-pointer"
      ref={target}
      onClick={() => handleClick()}
    >
      {!Editing && (
        <>
          {value ? (
            <span className="fw-500">{value.label}</span>
          ) : (
            <span className="text-muted2">Chọn loại</span>
          )}
        </>
      )}
      {Editing && target && (
        <Overlay
          target={target.current}
          show={Editing}
          placement="right"
          //container={container}
          onHide={handleHide}
          rootClose
        >
          {({ placement, arrowProps, show: _show, popper, ...props }) => (
            <div
              {...props}
              style={{
                position: 'absolute',
                width: 190,
                ...props.style
              }}
            >
              <Select
                isLoading={loading}
                className="select-control"
                classNamePrefix="select"
                placeholder="Chọn loại"
                //menuPosition="fixed"
                name="Type"
                //menuIsOpen={true}
                onChange={otp => {
                  onSubmit(otp)
                }}
                value={value}
                isClearable={true}
                options={[
                  {
                    label: 'Khách hàng công ty',
                    value: 'Khách hàng công ty'
                  },
                  {
                    label: 'Sale tìm kiếm',
                    value: 'Sale tìm kiếm'
                  }
                ]}
              />
            </div>
          )}
        </Overlay>
      )}
    </div>
  )
}

const EditableCellIsCoop = ({
  rowData,
  container,
  showEditing,
  hideEditing
}) => {
  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))
  const [Editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [value, setValue] = useState({
    label: rowData?.IsCoop ? 'Có' : 'Không',
    value: rowData?.IsCoop
  })
  const target = useRef(null)

  useEffect(() => {
    setValue({
      label: rowData?.IsCoop ? 'Có' : 'Không',
      value: rowData?.IsCoop
    })
  }, [rowData?.IsCoop])

  const handleClick = () => {
    if (!teleAdv) return
    setEditing(true)
    showEditing()
  }

  const handleHide = () => {
    setEditing(false)
    hideEditing()
  }

  const onSubmit = options => {
    setLoading(true)
    const newData = {
      arr: [
        {
          ID: rowData.ID,
          IsCoop: options ? options.value : ''
        }
      ]
    }
    telesalesApi
      .updateMemberIDTelesales(newData)
      .then(response => {
        setValue(options)
        setLoading(false)
      })
      .catch(error => console.log(error))
  }

  return (
    <div
      className="h-100 d-flex align-items-center cursor-pointer"
      ref={target}
      onClick={() => handleClick()}
    >
      {!Editing && (
        <span
          className={clsx(
            'fw-500',
            value?.value ? 'text-success' : 'text-danger'
          )}
        >
          {value ? value.label : 'Chọn'}
        </span>
      )}
      {Editing && target && (
        <Overlay
          target={target.current}
          show={Editing}
          placement="right"
          //container={container}
          onHide={handleHide}
          rootClose
        >
          {({ placement, arrowProps, show: _show, popper, ...props }) => (
            <div
              {...props}
              style={{
                position: 'absolute',
                width: 120,
                ...props.style
              }}
            >
              <Select
                isLoading={loading}
                className="select-control"
                classNamePrefix="select"
                placeholder="Chọn"
                //menuPosition="fixed"
                name="IsCoop"
                //menuIsOpen={true}
                onChange={otp => {
                  onSubmit(otp)
                }}
                value={value}
                isClearable={false}
                options={[
                  {
                    label: 'Có',
                    value: true
                  },
                  {
                    label: 'Không',
                    value: false
                  }
                ]}
              />
            </div>
          )}
        </Overlay>
      )}
    </div>
  )
}

const EditableCellStatus = ({
  rowData,
  container,
  showEditing,
  hideEditing
}) => {
  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))
  const [Editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [value, setValue] = useState(
    rowData?.Status
      ? {
          label: rowData?.Status,
          value: rowData?.Status
        }
      : null
  )
  const target = useRef(null)

  useEffect(() => {
    setValue(
      rowData?.Status
        ? {
            label: rowData?.Status,
            value: rowData?.Status
          }
        : null
    )
  }, [rowData?.Status])

  const handleClick = () => {
    if (!teleAdv) return
    setEditing(true)
    showEditing()
  }

  const handleHide = () => {
    setEditing(false)
    hideEditing()
  }

  const onSubmit = options => {
    setLoading(true)
    const newData = {
      arr: [
        {
          ID: rowData.ID,
          Status: options ? options.value : null
        }
      ]
    }
    telesalesApi
      .updateMemberIDTelesales(newData)
      .then(response => {
        setValue(options)
        setLoading(false)
      })
      .catch(error => console.log(error))
  }

  return (
    <div
      className="h-100 d-flex align-items-center cursor-pointer"
      ref={target}
      onClick={() => handleClick()}
    >
      {!Editing && (
        <>
          {value ? (
            <span className="fw-500">{value.label}</span>
          ) : (
            <span className="text-muted2">Chọn tình trạng</span>
          )}
        </>
      )}
      {Editing && target && (
        <Overlay
          target={target.current}
          show={Editing}
          placement="right"
          //container={container}
          onHide={handleHide}
          rootClose
        >
          {({ placement, arrowProps, show: _show, popper, ...props }) => (
            <div
              {...props}
              style={{
                position: 'absolute',
                width: 190,
                ...props.style
              }}
            >
              <Select
                isLoading={loading}
                className="select-control"
                classNamePrefix="select"
                placeholder="Chọn"
                //menuPosition="fixed"
                name="Status"
                //menuIsOpen={true}
                onChange={otp => {
                  onSubmit(otp)
                }}
                value={value}
                isClearable={false}
                options={[
                  {
                    label: 'Đang hoạt động',
                    value: 'Đang hoạt động'
                  },
                  {
                    label: 'Đã hết hạn hoặc bỏ',
                    value: 'Đã hết hạn hoặc bỏ'
                  }
                ]}
              />
            </div>
          )}
        </Overlay>
      )}
    </div>
  )
}

const EditableCellNote = ({ rowData, container, showEditing, hideEditing }) => {
  const [Editing, setEditing] = useState(false)

  const [value, setValue] = useState(rowData?.Desc)
  const target = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    setValue(rowData?.Desc)
  }, [rowData?.Desc])

  const handleClick = () => {
    setEditing(true)
    showEditing()
  }

  const handleHide = () => {
    setEditing(false)
    hideEditing()
  }

  const onSubmit = e => {
    const value = e.target.value

    const newData = {
      items: [
        {
          MemberID: rowData?.ID,
          Note: value
        }
      ]
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      telesalesApi
        .editNoteMember(newData)
        .then(response => {
          //setValue(value)
        })
        .catch(error => console.log(error))
    }, 300)
  }

  return (
    <div
      className="h-100 d-flex align-items-center cursor-pointer w-full"
      ref={target}
      onClick={() => handleClick()}
    >
      {!Editing && (
        <div
          className="text-truncate"
          style={{
            width: 290
          }}
        >
          <Text tooltipMaxWidth={290}>
            {value ? (
              <span className="fw-500">{value}</span>
            ) : (
              <span className="text-muted2">Nhập ghi chú</span>
            )}
          </Text>
        </div>
      )}
      {Editing && target && (
        <Overlay
          target={target.current}
          show={Editing}
          placement="right"
          //container={container}
          onHide={handleHide}
          rootClose
        >
          {({ placement, arrowProps, show: _show, popper, ...props }) => (
            <div
              {...props}
              style={{
                position: 'absolute',
                width: 260,
                ...props.style
              }}
            >
              <div>
                <textarea
                  className="w-100 form-control p-12px fw-500"
                  rows="5"
                  placeholder="Nhập ghi chú"
                  onChange={e => setValue(e.target.value)}
                  onBlur={onSubmit}
                  value={value}
                ></textarea>
              </div>
            </div>
          )}
        </Overlay>
      )}
    </div>
  )
}

const EditableCellSoftLink = ({
  rowData,
  container,
  showEditing,
  hideEditing
}) => {
  const [Editing, setEditing] = useState(false)

  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))

  const [value, setValue] = useState(rowData?.SoftLink)
  const target = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    setValue(rowData?.SoftLink)
  }, [rowData?.SoftLink])

  const handleClick = () => {
    if (!teleAdv) return
    setEditing(true)
    showEditing()
  }

  const handleHide = () => {
    setEditing(false)
    hideEditing()
  }

  const onSubmit = e => {
    const value = e.target.value

    const newData = {
      arr: [
        {
          ID: rowData.ID,
          SoftLink: value
        }
      ]
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      telesalesApi
        .updateMemberIDTelesales(newData)
        .then(response => {
          //setValue(value)
        })
        .catch(error => console.log(error))
    }, 300)
  }

  return (
    <div
      className="h-100 d-flex align-items-center cursor-pointer w-full"
      ref={target}
      onClick={() => handleClick()}
    >
      {!Editing && (
        <div
          className="text-truncate"
          style={{
            width: 290
          }}
        >
          <Text tooltipMaxWidth={290}>
            {value ? (
              <span className="fw-500">{value}</span>
            ) : (
              <span className="text-muted2">Nhập link phần mềm</span>
            )}
          </Text>
        </div>
      )}
      {Editing && target && (
        <Overlay
          target={target.current}
          show={Editing}
          placement="right"
          //container={container}
          onHide={handleHide}
          rootClose
        >
          {({ placement, arrowProps, show: _show, popper, ...props }) => (
            <div
              {...props}
              style={{
                position: 'absolute',
                width: 260,
                ...props.style
              }}
            >
              <div>
                <textarea
                  className="w-100 form-control p-12px fw-500"
                  rows="4"
                  placeholder="Nhập link"
                  onChange={e => setValue(e.target.value)}
                  onBlur={onSubmit}
                  value={value}
                ></textarea>
              </div>
            </div>
          )}
        </Overlay>
      )}
    </div>
  )
}

const EditableCellPDF = ({ rowData, container, showEditing, hideEditing }) => {
  const [value, setValue] = useState(rowData?.ContractDefault)
  const fileInputRef = useRef()

  const { teleAdv } = useSelector(({ auth }) => ({
    teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false
  }))

  useEffect(() => {
    setValue(rowData?.ContractDefault)
  }, [rowData?.ContractDefault])

  const uploadMutation = useMutation({
    mutationFn: async body => {
      let { data } = await moreApi.uploadFile(body)
      const newData = {
        arr: [
          {
            ID: rowData.ID,
            ContractDefault: data?.data || ''
          }
        ]
      }
      await telesalesApi.updateMemberIDTelesales(newData)
      return data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: body => telesalesApi.updateMemberIDTelesales(body)
  })

  const handleChange = event => {
    const files = event.target.files
    var bodyFormData = new FormData()
    bodyFormData.append('file', files[0])
    uploadMutation.mutate(bodyFormData, {
      onSuccess: data => {
        setValue(data.data)
      }
    })
  }

  const onDelete = () => {
    Swal.fire({
      title: 'Thực hiện xóa ?',
      html: `Bạn đang thực hiện xóa File hợp đồng này.`,
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'bg-danger'
      },
      preConfirm: () =>
        new Promise((resolve, reject) => {
          deleteMutation.mutate(
            {
              arr: [
                {
                  ID: rowData.ID,
                  ContractDefault: ''
                }
              ]
            },
            {
              onSuccess: () => {
                setValue('')
                resolve()
              }
            }
          )
        }),
      allowOutsideClick: () => !Swal.isLoading()
    })
  }

  return (
    <div className="w-full">
      {value && (
        <div className="mb-2">
          <a
            href={AssetsHelpers.toUrlServer(`/upload/image/${value}`)}
            target="_blank"
            rel="noreferrer"
          >
            Xem hợp đồng
          </a>
          {teleAdv && (
            <span
              className="text-danger ml-15px cursor-pointer"
              onClick={onDelete}
            >
              [Xoá]
            </span>
          )}
        </div>
      )}
      {teleAdv && (
        <button
          type="button"
          className="btn btn-out btn-default"
          onClick={() => fileInputRef.current.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? 'Đang upload ...' : 'Upload File'}
        </button>
      )}

      <input
        title="Upload File"
        value=""
        onChange={handleChange}
        multiple={false}
        ref={fileInputRef}
        type="file"
        hidden
      />
    </div>
  )
}

const columnsSort = window?.top?.GlobalConfig?.Admin?.kpiSortColumn || null

function TelesalesList(props) {
  const { User, CrStockID, filtersRedux } = useSelector(
    ({ auth, telesales }) => ({
      User: auth?.Info?.User,
      teleAdv: auth?.Info?.rightsSum?.teleAdv?.hasRight || false,
      CrStockID: auth?.Info?.CrStockID || '',
      filtersRedux: telesales.filters
    })
  )
  const [ListTelesales, setListTelesales] = useState([])
  const [loading, setLoading] = useState(false)
  const [PageCount, setPageCount] = useState(0)
  const [PageTotal, setPageTotal] = useState(0)
  const [IsEditing, setIsEditing] = useState(false)
  const [isModal, setIsModal] = useState(false)
  const [IsLoadingEx, setIsLoadingEx] = useState(false)

  const { onOpenSidebar } = useContext(TelesalesContext)
  const dispatch = useDispatch()

  const [filters, setFilters] = useState({
    withsNoti: true,
    filter: {
      UserID: '',
      UserSupportID: '',
      Status: '',
      IsCoop: false,
      Type: '',
      tele_process: filtersRedux.tele_process || '', //Đang tiếp cận,Đặt lịch thành công
      tele_user_id: filtersRedux.tele_user_id
        ? filtersRedux.tele_user_id
        : {
            label: User.FullName,
            value: User.ID
          },
      wishlist: filtersRedux.wishlist || '', // id,id san_pham
      birthDateFrom: filtersRedux.birthDateFrom || '', //31/12
      birthDateTo: filtersRedux.birthDateTo || '', //31/12
      bookDateFrom: filtersRedux.bookDateFrom || '', // dd/mm/yyyy
      bookDateTo: filtersRedux.bookDateTo || '', // dd/mm/yyyy
      last_used: filtersRedux.last_used || '',
      remains: filtersRedux.remains || '', //
      key: filtersRedux.key || '',
      emptyStaff: filtersRedux.emptyStaff || false,
      NotiFrom: filtersRedux.NotiFrom || '',
      NotiTo: filtersRedux.NotiTo || '',
      HasNoti: filtersRedux.HasNoti || false,
      StockID: filtersRedux.StockID || CrStockID,
      CreateFrom: filtersRedux.CreateFrom || '',
      CreateTo: filtersRedux.CreateTo || ''
    },
    pi: 1,
    ps: 20
  })
  const [configs, setConfigs] = useState(
    localStorage.getItem('_configs')
      ? JSON.parse(localStorage.getItem('_configs'))
      : [
          {
            title: 'Ngày tạo & Cơ sở',
            visible: true
          },
          {
            title: 'Trạng thái',
            visible: true
          },
          {
            title: 'Ghi chú',
            visible: true
          },
          {
            title: 'Lịch sử chăm sóc',
            visible: true
          },
          {
            title: 'Lịch nhắc',
            visible: true
          },
          {
            title: 'Sale phụ trách',
            visible: true
          },
          {
            title: 'Support phụ trách',
            visible: true
          },
          {
            title: 'Người tạo',
            visible: true
          },
          {
            title: 'Loại khách hàng',
            visible: true
          },
          {
            title: 'Cộng tác viên',
            visible: true
          },
          {
            title: 'Tình trạng',
            visible: true
          },
          {
            title: 'Link phần mềm',
            visible: true
          },
          {
            title: 'PDF hợp đồng',
            visible: true
          },
          {
            title: 'Hợp đồng',
            visible: true
          },
          {
            title: 'Tích điểm',
            visible: true
          }
        ]
  )

  const { width } = useWindowSize()

  useEffect(() => {
    getListTelesales()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListTelesales = callback => {
    setLoading(true)
    let tele_user_id_new = ''
    if (filters.filter.emptyStaff) {
      tele_user_id_new = 0
    } else {
      tele_user_id_new = filters.filter.tele_user_id
        ? filters.filter.tele_user_id.value
        : ''
    }
    const newFilter = {
      ...filters,
      filter: {
        ...filters.filter,
        Status: filters.filter?.Status?.value || '',
        Type: filters.filter?.Type?.value || '',
        UserID: filters.filter?.UserID?.value || 0,
        UserSupportID: filters.filter?.UserSupportID?.value || 0,
        tele_user_id: tele_user_id_new,
        tele_process: filters.filter.tele_process
          ? filters.filter.tele_process.join(',')
          : '',
        wishlist: filters.filter.wishlist
          ? filters.filter.wishlist.map(wish => wish.value).join(',')
          : '',
        birthDateFrom: filters.filter.birthDateFrom
          ? moment(filters.filter.birthDateFrom).format('DD/MM')
          : '',
        birthDateTo: filters.filter.birthDateTo
          ? moment(filters.filter.birthDateTo).format('DD/MM')
          : '',
        bookDateFrom: filters.filter.bookDateFrom
          ? moment(filters.filter.bookDateFrom).format('DD/MM/YYYY')
          : '',
        bookDateTo: filters.filter.bookDateTo
          ? moment(filters.filter.bookDateTo).format('DD/MM/YYYY')
          : '',
        NotiFrom: filters.filter.NotiFrom
          ? moment(filters.filter.NotiFrom).format('DD/MM/YYYY')
          : '',
        NotiTo: filters.filter.NotiTo
          ? moment(filters.filter.NotiTo).format('DD/MM/YYYY')
          : '',
        CreateFrom: filters.filter.CreateFrom
          ? moment(filters.filter.CreateFrom).format('DD/MM/YYYY')
          : '',
        CreateTo: filters.filter.CreateTo
          ? moment(filters.filter.CreateTo).format('DD/MM/YYYY')
          : ''
      },
      pi: callback ? 1 : filters.pi
    }

    telesalesApi
      .getListMemberTelesales(newFilter)
      .then(({ data }) => {
        if (data.error) {
          setLoading(false)
          // Xử lí lỗi
        } else {
          const { List, PCount, Total } = {
            List: data?.data || [],
            Pcount: data?.pCount || 0,
            Total: data?.total || 0
          }
          if (filters.pi > 1) {
            setListTelesales(prevState => [...prevState, ...List])
          } else {
            setListTelesales(List)
          }
          setPageCount(PCount)
          setPageTotal(Total)
          setLoading(false)
          callback && callback()
        }
      })
      .catch(error => console.log(error))
  }

  window.top.getListTelesales = getListTelesales

  window.updateMemberTelesale = key => {
    return new Promise(function (resolve, reject) {
      const newFilter = {
        withsNoti: true,
        filter: {
          tele_process: '',
          tele_user_id: '',
          wishlist: '',
          birthDateFrom: '',
          birthDateTo: '',
          bookDateFrom: '',
          bookDateTo: '',
          last_used: '',
          remains: '',
          key: key,
          emptyStaff: false,
          NotiFrom: '',
          NotiTo: '',
          HasNoti: false,
          StockID: '',
          CreateFrom: '',
          CreateTo: ''
        },
        pi: 1,
        ps: 20
      }
      telesalesApi.getListMemberTelesales(newFilter).then(({ data }) => {
        if (data && data.data && data.data.length > 0) {
          let crMember = data.data[0]
          let newList = ListTelesales ? [...ListTelesales] : []

          let index = newList.findIndex(x => x.ID === crMember.ID)
          if (index > -1) {
            newList[index] = crMember
          }

          setListTelesales(newList)
        }
        resolve()
      })
    })
  }

  const onRefresh = callback => {
    if (filters.pi > 1) {
      setFilters(prevState => ({ ...prevState, pi: 1 }))
      callback && callback()
    } else {
      getListTelesales(() => {
        callback && callback()
      })
    }
  }

  // const callNow = phone => {
  //   if (!phone) return
  //   setLoadingCall(phone)
  //   telesalesApi
  //     .callNow({ Phone: phone })
  //     .then(({ data }) => {
  //       if (data?.error) {
  //         window?.top?.toastr?.error(data?.error, '', { timeOut: 1000 })
  //       }
  //       setLoadingCall('')
  //     })
  //     .catch(err => {
  //       console.log(err)
  //     })
  // }

  const columns = useMemo(
    () => {
      let newColumns = [
        {
          key: 'CreateDate',
          title: 'Ngày tạo & Cơ sở',
          dataKey: 'CreateDate',
          cellRenderer: ({ rowData }) => (
            <div>
              <div className="fw-600">
                {moment(rowData?.CreateDate).format('DD-MM-YYYY')}
              </div>
              <div>{rowData.ByStock.Title}</div>
            </div>
          ),
          width: 180,
          sortable: false
        },
        {
          key: 'FullName',
          title: 'Khách hàng',
          dataKey: 'FullName',
          cellRenderer: ({ rowData, container }) => (
            <div>
              <div
                className="cursor-pointer"
                onClick={() =>
                  window?.top?.MemberEdit({
                    Member: rowData,
                    done: () =>
                      window?.top?.getListTelesales &&
                      window?.top?.getListTelesales()
                  })
                }
              >
                <div className="fw-600">{rowData?.FullName}</div>
                <div className="font-number">
                  {rowData.HandCardID} : {rowData?.MobilePhone}
                </div>
              </div>
            </div>
          ),
          width: 200,
          sortable: false,
          frozen: 'left'
        },
        {
          key: 'TeleTags',
          title: 'Trạng thái',
          dataKey: 'TeleTags',
          width: 250,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <PickerStatus data={rowData} onRefresh={onRefresh}></PickerStatus>
            // <EditableCellProcess
            //   rowData={rowData}
            //   container={container}
            //   hideEditing={() => setIsEditing(false)}
            //   showEditing={() => setIsEditing(true)}
            // />
          )
        },
        {
          key: 'TeleNote',
          title: 'Ghi chú',
          dataKey: 'TeleNote',
          width: 290,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <EditableCellNote
              rowData={rowData}
              container={container}
              hideEditing={() => setIsEditing(false)}
              showEditing={() => setIsEditing(true)}
            />
          )
        },
        {
          key: 'TopTele',
          title: 'Lịch sử chăm sóc',
          cellRenderer: ({ rowData }) => (
            <PickerHistory data={rowData} onRefresh={onRefresh}>
              {/* {({ open }) => (
                <div onClick={open}>
                  {rowData.TopTele && rowData.TopTele.length > 0 ? (
                    <div className="d-flex flex-column">
                      <div>
                        {moment(rowData.TopTele[0].CreateDate).format(
                          'HH:mm DD-MM-YYYY'
                        )}
                        {rowData.TopTele[0].Audio && (
                          <a
                            className="ml-10px"
                            href={'/upload/image/' + rowData.TopTele[0].Audio}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <i className="fas fa-play"></i>
                          </a>
                        )}
                      </div>
                      <Text
                        className="flex-1 pr-10px"
                        style={{ width: '260px' }}
                        tooltipMaxWidth={280}
                      >
                        {rowData.TopTele[0].Content}
                      </Text>
                    </div>
                  ) : (
                    <>Chưa có liên hệ</>
                  )}
                </div>
              )} */}
            </PickerHistory>
          ),
          dataKey: 'TopTele',
          width: 280,
          sortable: false
        },
        {
          key: 'reminder',
          title: 'Lịch nhắc',
          dataKey: 'reminder',
          width: 250,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <PickerReminder data={rowData} onRefresh={onRefresh}>
              {/* {({ open }) => (
                <div onClick={open}>
                  <div>
                    {rowData.NotiList && rowData.NotiList.length > 0 ? (
                      <>
                        <div className="mt-8px fw-500">
                          Ngày nhắc
                          <span className="pl-5px">
                            {moment(rowData.NotiList[0].Date).format(
                              'DD-MM-YYYY'
                            )}
                          </span>
                          {rowData.NotiList[0].IsNoti && (
                            <span className="pl-5px font-size-xs text-success">
                              - Đã nhắc
                            </span>
                          )}
                        </div>
                        <Text style={{ width: '230px' }} tooltipMaxWidth={250}>
                          Nội dung :
                          <span className="fw-500 pl-3px">
                            {rowData.NotiList[0].Desc}
                          </span>
                        </Text>
                      </>
                    ) : (
                      'Thêm lịch nhắc'
                    )}
                  </div>
                </div>
              )} */}
            </PickerReminder>
          )
        },
        {
          key: 'Staffs',
          title: 'Sale phụ trách',
          dataKey: 'Staffs',
          width: 220,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <EditableCell
              rowData={rowData}
              container={container}
              hideEditing={() => setIsEditing(false)}
              showEditing={() => setIsEditing(true)}
            />
          )
        },
        {
          key: 'UserSupportID',
          title: 'Support phụ trách',
          dataKey: 'UserSupportID',
          width: 220,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <EditableCellSupport
              rowData={rowData}
              container={container}
              hideEditing={() => setIsEditing(false)}
              showEditing={() => setIsEditing(true)}
            />
          )
        },
        {
          key: 'UserID',
          title: 'Người tạo',
          dataKey: 'UserID',
          width: 220,
          sortable: false,
          cellRenderer: ({ rowData, container }) => rowData?.User?.FullName
        },
        {
          key: 'Type',
          title: 'Loại khách hàng',
          dataKey: 'Type',
          width: 220,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <EditableCellType
              rowData={rowData}
              container={container}
              hideEditing={() => setIsEditing(false)}
              showEditing={() => setIsEditing(true)}
            />
          )
        },
        {
          key: 'IsCoop',
          title: 'Cộng tác viên',
          dataKey: 'IsCoop',
          width: 150,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <EditableCellIsCoop
              rowData={rowData}
              container={container}
              hideEditing={() => setIsEditing(false)}
              showEditing={() => setIsEditing(true)}
            />
          )
        },
        {
          key: 'Status',
          title: 'Tình trạng',
          dataKey: 'Status',
          width: 220,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <EditableCellStatus
              rowData={rowData}
              container={container}
              hideEditing={() => setIsEditing(false)}
              showEditing={() => setIsEditing(true)}
            />
          )
        },
        {
          key: 'SoftLink',
          title: 'Link phần mềm',
          dataKey: 'SoftLink',
          width: 290,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <EditableCellSoftLink
              rowData={rowData}
              container={container}
              hideEditing={() => setIsEditing(false)}
              showEditing={() => setIsEditing(true)}
            />
          )
        },
        {
          key: 'ContractDefault',
          title: 'PDF hợp đồng',
          dataKey: 'ContractDefault',
          width: 220,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <EditableCellPDF
              rowData={rowData}
              container={container}
              hideEditing={() => setIsEditing(false)}
              showEditing={() => setIsEditing(true)}
            />
          )
        },
        {
          key: 'ContractJSON',
          title: 'Hợp đồng',
          dataKey: 'ContractJSON',
          width: 250,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <PickerContract
              rowData={rowData}
              onRefresh={onRefresh}
            ></PickerContract>
          )
        },
        {
          key: 'PointJSON',
          title: 'Tích điểm',
          dataKey: 'PointJSON',
          width: 250,
          sortable: false,
          cellRenderer: ({ rowData, container }) => (
            <PickerPoint rowData={rowData} onRefresh={onRefresh}></PickerPoint>
          )
        }
        // {
        //   key: 'action',
        //   title: '',
        //   dataKey: 'action',
        //   cellRenderer: ({ rowData }) => (
        //     <div className="d-flex">
        //       <button
        //         disabled={loadingCall !== ''}
        //         type="button"
        //         onClick={() => callNow(rowData?.MobilePhone)}
        //         //href={`tel:${rowData?.MobilePhone}`}
        //         className="w-38px h-38px rounded-circle btn btn-success shadow mx-4px p-0 position-relative"
        //       >
        //         {loadingCall === rowData?.MobilePhone ? (
        //           <div
        //             className="position-absolute d-flex align-items-center justify-content-center"
        //             style={{
        //               top: '50%',
        //               left: '50%',
        //               transform: 'translate(-50%, -50%)',
        //               width: '100%',
        //               height: '100%'
        //             }}
        //           >
        //             <div className="spinner-border text-white" role="status">
        //               <span className="visually-hidden">Loading...</span>
        //             </div>
        //           </div>
        //         ) : (
        //           <img
        //             className="w-23px position-absolute top-7px right-7px"
        //             src={AssetsHelpers.toAbsoluteUrl(
        //               '/_assets/images/icon-call.png'
        //             )}
        //             alt="Call"
        //           />
        //         )}
        //       </button>
        //     </div>
        //   ),
        //   align: 'center',
        //   width: 80,
        //   sortable: false,
        //   frozen: width > 991 ? 'right' : false
        // }
      ]

      newColumns.forEach(function (value, i) {
        let index = configs.findIndex(x => x.title === value.title)
        if (index > -1) {
          newColumns[i].hidden = !configs[index].visible
        }
      })

      if (columnsSort && columnsSort.length > 0) {
        newColumns = newColumns.map(clm => {
          let newClm = { ...clm }
          const indexSort = columnsSort.findIndex(x => x.key === clm.key)
          if (indexSort > -1) {
            newClm['order'] = columnsSort[indexSort]['order']
            newClm['isvisible'] = columnsSort[indexSort]['isvisible']
          }
          return newClm
        })
      }
      return newColumns
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, ListTelesales, configs]
  )

  const handleEndReached = () => {
    if (ListTelesales.length < PageTotal) {
      setFilters(prevState => ({ ...prevState, pi: prevState.pi + 1 }))
    }
  }

  const onFilter = values => {
    dispatch(setFiltersTeles(values))
    setFilters(prevState => ({ ...prevState, ...values, pi: 1 }))
  }

  // const onOpenModal = () => {
  //   setIsModal(true)
  // }

  const onHideModal = () => {
    setIsModal(false)
  }

  const ExportExcel = () => {
    setIsLoadingEx(true)
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
            <span className="text-uppercase ">Danh sách -</span>
            <span className="text-danger pl-3px">{PageTotal}</span>
            <span className="pl-5px font-label text-muted font-size-sm text-none">
              khách hàng
            </span>
          </div>
          <div className="w-85px w-md-auto d-flex">
            <Navbar ExportExcel={ExportExcel} IsLoadingEx={IsLoadingEx} />
            <Dropdown className="d-inline mx-2">
              <Dropdown.Toggle
                id="dropdown-autoclose-true"
                style={{
                  borderRadius: '0.225rem'
                }}
              >
                <i className="fal fa-tools"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {configs &&
                  configs.map((item, index) => (
                    <div className="mb-8px" key={index}>
                      <label className="checkbox d-flex cursor-pointer ml-10px min-w-150px w-150px">
                        <input
                          type="checkbox"
                          name="filter"
                          checked={item.visible}
                          onChange={e => {
                            let newConfigs = [...configs]
                            let index = newConfigs.findIndex(
                              x => x.title === item.title
                            )
                            if (index > -1) {
                              newConfigs[index].visible = e.target.checked
                            }
                            setConfigs(newConfigs)
                            localStorage.setItem(
                              '_configs',
                              JSON.stringify(newConfigs)
                            )
                          }}
                        />
                        <span className="checkbox-icon" />
                        <span className="fw-500">{item.title}</span>
                      </label>
                    </div>
                  ))}
              </Dropdown.Menu>
            </Dropdown>
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
            data={ListTelesales}
            loading={loading}
            pageCount={PageCount}
            onEndReachedThreshold={300}
            onEndReached={handleEndReached}
            rowHeight={100}
            onScroll={() => IsEditing && document.body.click()}
            //onPagesChange={onPagesChange}
            //rowRenderer={rowRenderer}
          />
        </div>
      </div>
      <ReminderCalendar show={isModal} onHide={onHideModal} filters={filters} />
    </div>
  )
}

export default TelesalesList
