import './styles.css'
import { obtenerEstadoStock, type Producto } from '@repo/shared'
import { datosDesdeFormulario, mensajeDeError } from './form'

const form = document.querySelector<HTMLFormElement>('#product-form')!
const list = document.querySelector<HTMLDivElement>('#product-list')!
const status = document.querySelector<HTMLParagraphElement>('#status-message')!
const count = document.querySelector<HTMLSpanElement>('#product-count')!
const error = document.querySelector<HTMLParagraphElement>('#form-error')!
const title = document.querySelector<HTMLHeadingElement>('#form-title')!
const submit = document.querySelector<HTMLButtonElement>('#submit-button')!
const cancel = document.querySelector<HTMLButtonElement>('#cancel-button')!
let editingId: number | null = null

const money = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })

function showError(message: string) {
  error.textContent = message
  error.hidden = false
}

function clearError() {
  error.textContent = ''
  error.hidden = true
}

function resetForm() {
  editingId = null
  form.reset()
  title.textContent = 'Nuevo producto'
  submit.textContent = 'Guardar producto'
  cancel.hidden = true
  clearError()
}

function render(products: Array<Producto & { estadoStock?: ReturnType<typeof obtenerEstadoStock> }>) {
  count.textContent = String(products.length)
  list.replaceChildren()
  if (products.length === 0) {
    status.textContent = 'Aún no hay productos. Agrega el primero desde el formulario.'
    status.className = 'message empty'
    return
  }
  status.textContent = ''
  status.className = 'message'
  for (const product of products) {
    const item = document.createElement('article')
    item.className = 'product-row'
    const details = document.createElement('div')
    details.className = 'product-details'
    const name = document.createElement('h3')
    name.textContent = product.nombre
    const metadata = document.createElement('p')
    metadata.textContent = `${money.format(product.precio)} · ${product.stock} unidades`
    details.append(name, metadata)
    const state = document.createElement('span')
    const stateValue = product.estadoStock ?? obtenerEstadoStock(product.stock)
    state.className = `badge ${stateValue}`
    state.textContent = stateValue === 'agotado' ? 'Agotado' : stateValue === 'bajo' ? 'Stock bajo' : 'Disponible'
    const actions = document.createElement('div')
    actions.className = 'row-actions'
    const edit = document.createElement('button')
    edit.className = 'icon-button'
    edit.type = 'button'
    edit.textContent = 'Editar'
    edit.addEventListener('click', () => beginEdit(product))
    const remove = document.createElement('button')
    remove.className = 'icon-button danger'
    remove.type = 'button'
    remove.textContent = 'Eliminar'
    remove.addEventListener('click', () => removeProduct(product.id))
    actions.append(edit, remove)
    item.append(details, state, actions)
    list.append(item)
  }
}

async function loadProducts() {
  status.textContent = 'Cargando productos...'
  status.className = 'message loading'
  try {
    const response = await fetch('/productos')
    if (!response.ok) throw new Error('No se pudo cargar el catálogo.')
    const data = await response.json() as { productos: Producto[] }
    render(data.productos)
  } catch (cause) {
    status.textContent = mensajeDeError(cause)
    status.className = 'message error'
  }
}

function beginEdit(product: Producto) {
  editingId = product.id
  title.textContent = 'Editar producto'
  submit.textContent = 'Actualizar producto'
  cancel.hidden = false
  ;(form.elements.namedItem('nombre') as HTMLInputElement).value = product.nombre
  ;(form.elements.namedItem('precio') as HTMLInputElement).value = String(product.precio)
  ;(form.elements.namedItem('stock') as HTMLInputElement).value = String(product.stock)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function removeProduct(id: number) {
  if (!window.confirm('¿Deseas eliminar este producto?')) return
  try {
    const response = await fetch(`/productos/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('No se pudo eliminar el producto.')
    await loadProducts()
  } catch (cause) {
    status.textContent = mensajeDeError(cause)
    status.className = 'message error'
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearError()
  const datos = datosDesdeFormulario(form)
  if (!datos) return showError('Revisa el nombre, el precio y el stock.')
  const url = editingId === null ? '/productos' : `/productos/${editingId}`
  const method = editingId === null ? 'POST' : 'PUT'
  try {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) })
    if (!response.ok) throw new Error('No se pudo guardar el producto.')
    resetForm()
    await loadProducts()
  } catch (cause) { showError(mensajeDeError(cause)) }
})

cancel.addEventListener('click', resetForm)
loadProducts()
