import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Swal from 'sweetalert2'
import { Edit, Plus, Power, UserCog, X } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  createAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserStatus,
} from '../../services/adminUsersApi'

const initialForm = {
  nombreCompleto: '',
  username: '',
  email: '',
  password: '',
  rol: 'ADMIN',
  activo: true,
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return format(new Date(value), 'dd/MM/yyyy HH:mm')
  } catch {
    return value
  }
}

export function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadUsers = async () => {
    setLoading(true)
    try {
      setUsers(await getAdminUsers())
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cargar usuarios',
        text: error.response?.data?.message ?? 'Verifica que el backend este iniciado correctamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    getAdminUsers()
      .then((data) => {
        if (active) setUsers(data)
      })
      .catch((error) => {
        if (!active) return
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar usuarios',
          text: error.response?.data?.message ?? 'Verifica que el backend este iniciado correctamente.',
        })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const openCreate = () => {
    setEditingUser(null)
    setForm(initialForm)
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setForm({
      nombreCompleto: user.nombreCompleto,
      username: user.username,
      email: user.email ?? '',
      password: '',
      rol: user.rol,
      activo: user.activo,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, form)
      } else {
        await createAdminUser(form)
      }

      await Swal.fire({
        icon: 'success',
        title: editingUser ? 'Usuario actualizado' : 'Usuario creado',
        timer: 1300,
        showConfirmButton: false,
      })
      setModalOpen(false)
      loadUsers()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: error.response?.data?.message ?? 'Revisa los datos ingresados.',
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (user) => {
    try {
      await updateAdminUserStatus(user.id, !user.activo)
      loadUsers()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cambiar el estado',
        text: error.response?.data?.message ?? 'Intentalo nuevamente.',
      })
    }
  }

  return (
    <AdminLayout
      title="Usuarios administradores"
      description="Gestiona las cuentas que pueden ingresar al panel administrador del sistema."
    >
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Administradores registrados</h3>
            <p className="text-sm text-slate-600">
              Crea nuevos accesos, edita sus datos y activa o desactiva usuarios.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            <Plus size={18} aria-hidden="true" />
            Nuevo usuario
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-bold">Usuario</th>
                <th className="px-5 py-3 font-bold">Correo</th>
                <th className="px-5 py-3 font-bold">Rol</th>
                <th className="px-5 py-3 font-bold">Ultimo acceso</th>
                <th className="px-5 py-3 font-bold">Estado</th>
                <th className="px-5 py-3 font-bold">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan="6">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan="6">
                    Todavia no hay usuarios administradores.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">{user.nombreCompleto}</p>
                      <p className="mt-1 text-xs text-slate-500">@{user.username}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user.email || '-'}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{user.rol}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(user.ultimoAccesoEn)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-red-700 hover:text-red-700"
                          title="Editar usuario"
                        >
                          <Edit size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(user)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-red-700 hover:text-red-700"
                          title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          <Power size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <UserModal
          editingUser={editingUser}
          form={form}
          setForm={setForm}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </AdminLayout>
  )
}

function UserModal({ editingUser, form, setForm, saving, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-5 py-6">
      <section className="w-full max-w-2xl rounded-md bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-100 text-red-700">
              <UserCog size={21} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                {editingUser ? 'Editar administrador' : 'Nuevo administrador'}
              </h3>
              <p className="text-sm text-slate-500">
                {editingUser ? 'Actualiza datos y clave si es necesario.' : 'Crea una nueva cuenta de acceso.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={onSubmit} className="space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Nombre completo" field="nombreCompleto" form={form} setForm={setForm} required />
            <TextInput label="Usuario" field="username" form={form} setForm={setForm} required />
            <TextInput label="Correo electronico" field="email" type="email" form={form} setForm={setForm} />
            <TextInput
              label={editingUser ? 'Nueva clave' : 'Clave'}
              field="password"
              type="password"
              form={form}
              setForm={setForm}
              required={!editingUser}
              placeholder={editingUser ? 'Dejar vacio para mantener la actual' : ''}
            />
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Rol</span>
              <select
                value={form.rol}
                onChange={(event) => setForm((current) => ({ ...current, rol: event.target.value }))}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="COORDINADOR">COORDINADOR</option>
              </select>
            </label>
            <label className="flex items-center gap-3 pt-8 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))}
                className="h-5 w-5 accent-red-700"
              />
              Usuario activo
            </label>
          </div>

          <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-red-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function TextInput({ label, field, form, setForm, type = 'text', required, placeholder }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={form[field]}
        placeholder={placeholder}
        onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
        required={required}
      />
    </label>
  )
}
