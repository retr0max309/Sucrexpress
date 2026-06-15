'use client'

import ProtectedRoute from '@/components/common/ProtectedRoute'
import AdminPage from '@/pages/AdminPage'

export default function AdminRoute() {
  return (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  )
}
