import React from 'react'
import { Navigate } from 'react-router-dom'
import { useRoles } from 'src/hooks/useRoles'

export default function UnauthenticateGuard({ children }) {
  const { co_ban } = useRoles(['co_ban'])

  if (!co_ban.hasRight) {
    return <Navigate to="/yeu-cau-quyen-truy-cap" />
  }

  return children
}
