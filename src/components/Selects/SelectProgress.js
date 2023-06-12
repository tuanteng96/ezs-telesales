import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'
import configApi from 'src/api/config.api'
import clsx from 'clsx'
import { useTeleDetail } from 'src/features/Telesales/pages/TelesalesDetail/TelesalesDetailLayout'

SelectProgress.propTypes = {
  onChange: PropTypes.func
}

function SelectProgress({ onChange, value, isLoading, className, ...props }) {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])
  const { setTagsList } = useTeleDetail()

  useEffect(() => {
    getAllProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getAllProgress = async () => {
    const result = window.top.Configs[0].Value
    const newResult = JSON.parse(result).map(item => ({
      value: item.Title,
      label: item.Title,
      options:
        item.Children &&
        item.Children.map(o => ({
          value: o.Title,
          label: o.Title
        }))
    }))
    setOptions(newResult)
    setTagsList && setTagsList(newResult)
  }

  return (
    <Select
      {...props}
      isLoading={isLoading || loading}
      classNamePrefix="select"
      className={clsx('select-control', className)}
      options={options}
      value={value}
      onChange={onChange}
      noOptionsMessage={({ inputValue }) => 'Không có dữ liệu'}
    />
  )
}

export default SelectProgress
