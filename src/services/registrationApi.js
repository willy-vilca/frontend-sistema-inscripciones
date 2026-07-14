import { api } from './api'

export async function getRegistrationCatalogs() {
  const response = await api.get('/public/inscripcion/catalogos')
  return response.data
}

export async function getApplicationConsultCatalogs() {
  const response = await api.get('/public/inscripcion/catalogos-consulta')
  return response.data
}

export async function verifyDocumentAvailability(payload) {
  const response = await api.post('/public/inscripcion/verificar-documento', payload)
  return response.data
}

export async function getReniecDniData(numero) {
  const response = await api.get('/public/inscripcion/reniec/dni', {
    params: { numero },
  })
  return response.data
}

export async function validateRegistrationPayment(payload) {
  const response = await api.post('/public/inscripcion/validar-pago', payload)
  return response.data
}

export async function consultApplication(payload) {
  const response = await api.post('/public/inscripcion/consultar', payload)
  return response.data
}

export async function getAcademicAreas() {
  const response = await api.get('/public/catalogos/areas')
  return response.data
}

export async function getProfessionalSchools(areaId) {
  const response = await api.get('/public/catalogos/escuelas', {
    params: { areaId },
  })
  return response.data
}

export async function getAcademicPrograms(escuelaId) {
  const response = await api.get('/public/catalogos/programas', {
    params: { escuelaId },
  })
  return response.data
}

export async function registerApplication(payload, photo, documents) {
  const formData = new FormData()
  const normalizedPhoto = await normalizePhotoFile(photo)

  formData.append('datos', JSON.stringify(payload))
  formData.append('foto', normalizedPhoto)

  Object.entries(documents).forEach(([key, file]) => {
    if (file) {
      formData.append('documentos', file)
      formData.append('documentoKeys', key)
    }
  })

  const response = await api.post('/public/inscripcion/registrar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 180000,
  })

  return response.data
}

async function normalizePhotoFile(photo) {
  if (!photo) return photo

  const bitmap = await loadImageBitmap(photo)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0)

  if (typeof bitmap.close === 'function') {
    bitmap.close()
  }

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('No se pudo procesar la fotografia.'))
        }
      },
      'image/jpeg',
      0.92,
    )
  })

  return new File([blob], photo.name.replace(/\.[^.]+$/, '') + '.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

async function loadImageBitmap(file) {
  if ('createImageBitmap' in window) {
    return createImageBitmap(file)
  }

  return new Promise((resolve, reject) => {
    const image = new window.Image()
    const objectUrl = window.URL.createObjectURL(file)

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0)
      window.URL.revokeObjectURL(objectUrl)
      resolve(canvas)
    }

    image.onerror = () => {
      window.URL.revokeObjectURL(objectUrl)
      reject(new Error('La fotografia no tiene un formato valido.'))
    }

    image.src = objectUrl
  })
}

export async function downloadApplicantCard(downloadUrl, filename) {
  const response = await api.get(downloadUrl, {
    responseType: 'blob',
    timeout: 180000,
  })

  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = blobUrl
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}
