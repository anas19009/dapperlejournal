'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Loader2, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteUser, updateUserRole } from '@/features/users/actions'
import type { Profile } from '@/features/users/types'

interface UserTableProps {
  users: Profile[]
  currentUserId: string
}

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleRoleChange(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'author' : currentRole === 'author' ? 'viewer' : 'admin'
    const explanation = newRole === 'viewer'
      ? 'Viewer means a normal account with no author or admin dashboard permissions.'
      : `This will give the user ${newRole} permissions.`
    if (!confirm(`Change role to ${newRole}? ${explanation} The user must log out and back in for the change to take effect.`)) return
    setUpdating(userId)
    const result = await updateUserRole(userId, newRole)
    result.error ? toast.error(result.error) : toast.success(`Role updated to ${newRole}`)
    setUpdating(null)
  }

  async function handleDelete(userId: string, name: string) {
    if (!confirm(`Delete ${name} and all of their comments? This cannot be undone.`)) return
    setDeleting(userId)
    const result = await deleteUser(userId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('User and comments deleted')
      window.location.reload()
    }
    setDeleting(null)
  }

  if (users.length === 0) {
    return (
      <div className="users-panel flex flex-col items-center justify-center border-2 border-black bg-white py-20 text-center shadow-shadow">
        <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-black bg-secondary">
          <Users className="icon-on-color h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">No users yet</h3>
      </div>
    )
  }

  return (
    <div className="users-panel overflow-hidden border-2 border-black bg-white shadow-shadow">
      <table className="w-full text-sm">
        <thead className="users-table-head">
          <tr className="border-b-2 border-black bg-muted/50">
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Email</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Joined</th>
            <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((user) => {
            const name = user.full_name ?? 'Unnamed'
            const initials = user.full_name
              ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
              : user.email[0]?.toUpperCase() ?? '?'
            const isAdmin = user.role === 'admin'
            const roleLabel = isAdmin ? 'Admin' : user.role === 'author' ? 'Author' : 'Viewer'
            const isCurrent = user.id === currentUserId

            return (
              <tr key={user.id} className="group transition-colors duration-150 hover:bg-accent/20">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                                                                           
                      <img
                        src={user.avatar_url}
                        alt={`${name} avatar`}
                        className="h-8 w-8 shrink-0 rounded-none border-2 border-black object-cover shadow-[3px_3px_0_0_#000]"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-secondary text-xs font-bold text-white shadow-[3px_3px_0_0_#000]">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{name}</p>
                      {isCurrent && (
                        <span className="text-[10px] font-medium text-primary">You</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{user.email}</td>
                <td className="px-5 py-4">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1.5 border-2 border-black bg-primary px-2.5 py-1 text-xs font-bold text-white">
                      <span className="h-1.5 w-1.5 bg-white" />
                      {roleLabel}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 border-2 border-black bg-secondary px-2.5 py-1 text-xs font-bold text-white">
                      <span className="h-1.5 w-1.5 bg-white" />
                      {roleLabel}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 hidden lg:table-cell text-sm text-muted-foreground">
                  {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '—'}
                </td>
                <td className="px-5 py-4 text-right">
                  {!isCurrent && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updating === user.id || deleting === user.id}
                        onClick={() => handleRoleChange(user.id, user.role)}
                        className="users-action-btn text-xs h-8"
                      >
                        {updating === user.id ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Updating…</>
                        ) : (
                          `Make ${user.role === 'admin' ? 'Author' : user.role === 'author' ? 'Viewer' : 'Admin'}`
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleting === user.id || updating === user.id}
                        onClick={() => handleDelete(user.id, name)}
                        className="users-delete-btn h-8 px-2"
                        aria-label={`Delete ${name}`}
                      >
                        {deleting === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
