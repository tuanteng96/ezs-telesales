import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'
import configApi from 'src/api/config.api'
import clsx from 'clsx'

SelectTeleHis.propTypes = {
  onChange: PropTypes.func
}

function SelectTeleHis({ onChange, value, isLoading, className, ...props }) {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])

  useEffect(() => {
    getAllTeleHis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getAllTeleHis = async () => {
    setLoading(true)
    const { data } = await configApi.getConfigName('kqtele')
    if (data && data.data && data?.data.length > 0) {
      const result = data.data[0].ValueText
      const newResult = result
        ? result.split(',').map(item => ({
            value: item,
            label: item
          }))
        : []
      setOptions(newResult)
      setLoading(false)
    }
  }

  return (
    <Select
      {...props}
      isClearable
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

export default SelectTeleHis
