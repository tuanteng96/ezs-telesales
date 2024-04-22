import React from 'react'
import { Navigate } from 'react-router-dom'
import { useRoles } from 'src/hooks/useRoles'

export default function AuthenticateGuard({ children }) {
  const { ky_thuat, co_ban } = useRoles(['ky_thuat', 'co_ban'])

  if (ky_thuat.hasRight || co_ban.hasRight) {
    return <Navigate to="/" />
  }

  return children
}
