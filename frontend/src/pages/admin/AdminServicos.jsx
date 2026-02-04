import { useEffect, useMemo, useState } from 'react'
import api from '../../api/api.js'

function AdminServicos() {
  const [servicos, setServicos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [editing, setEditing] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    description: '',
    durationMinutes: 30,
    category: '',
    subcategory: '',
    subcategory2: '',
    subcategory3: '',
  })
  const [editingCategory, setEditingCategory] = useState(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: '',
    level: 0,
    parent: '',
  })
  const [categoryError, setCategoryError] = useState('')

  useEffect(() => {
    const load = async () => {
      const [servicesRes, categoriesRes] = await Promise.all([
        api.get('/services'),
        api.get('/categories'),
      ])
      setServicos(servicesRes.data.services || [])
      setCategorias(categoriesRes.data.categories || [])
    }

    load().catch(() => {})
  }, [])

  const categoriesLevel0 = useMemo(
    () => categorias.filter((item) => item.level === 0),
    [categorias]
  )

  const categoriesByParent = useMemo(() => {
    const map = new Map()
    for (const item of categorias) {
      const key = item.parent || 'root'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    }
    return map
  }, [categorias])

  const categoryTree = useMemo(() => {
    const build = (parentId, depth = 0) => {
      const items = categoriesByParent.get(parentId || 'root') || []
      return items.flatMap((item) => [
        { ...item, depth },
        ...build(item._id, depth + 1),
      ])
    }
    return build(null)
  }, [categoriesByParent])

  const filtered = useMemo(() => {
    if (!selectedCategory) return servicos
    return servicos.filter((item) => item.category === selectedCategory)
  }, [servicos, selectedCategory])

  const gridItems = filtered.slice(0, 6)

  const startEdit = (service) => {
    setEditing({
      id: service._id,
      name: service.name || '',
      price: service.price || 0,
      description: service.description || '',
    })
  }

  const saveEdit = async () => {
    if (!editing) return
    await api.patch(`/services/${editing.id}`, {
      name: editing.name,
      price: Number(editing.price),
      description: editing.description,
    })
    const updated = servicos.map((item) =>
      item._id === editing.id
        ? { ...item, name: editing.name, price: editing.price, description: editing.description }
        : item
    )
    setServicos(updated)
    setEditing(null)
  }

  const openModal = () => {
    setIsModalOpen(true)
    setNewService({
      name: '',
      price: '',
      description: '',
      durationMinutes: 30,
      category: '',
      subcategory: '',
      subcategory2: '',
      subcategory3: '',
    })
  }

  const saveNewService = async () => {
    const payload = {
      name: newService.name,
      price: Number(newService.price),
      description: newService.description,
      durationMinutes: Number(newService.durationMinutes),
      category: newService.category,
      subcategory: newService.subcategory || null,
      subcategory2: newService.subcategory2 || null,
      subcategory3: newService.subcategory3 || null,
    }
    const res = await api.post('/services', payload)
    setServicos((prev) => [res.data.service, ...prev])
    setIsModalOpen(false)
  }

  const openCategoryModal = (cat = null) => {
    setCategoryError('')
    if (cat) {
      setCategoryForm({
        id: cat._id,
        name: cat.name || '',
        level: cat.level,
        parent: cat.parent || '',
      })
    } else {
      setCategoryForm({
        id: null,
        name: '',
        level: 0,
        parent: '',
      })
    }
    setIsCategoryModalOpen(true)
  }

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setCategoryError('Nome da categoria é obrigatório.')
      return
    }

    const payload = {
      name: categoryForm.name,
      level: Number(categoryForm.level),
      parentId: categoryForm.parent || null,
    }

    if (payload.level > 0 && !payload.parentId) {
      setCategoryError('Selecione a categoria pai correta.')
      return
    }

    if (categoryForm.id) {
      const res = await api.patch(`/categories/${categoryForm.id}`, {
        name: payload.name,
        parentId: payload.parentId,
      })
      const updated = categorias.map((item) =>
        item._id === categoryForm.id ? res.data.category : item
      )
      setCategorias(updated)
    } else {
      const res = await api.post('/categories', payload)
      setCategorias((prev) => [res.data.category, ...prev])
    }

    setIsCategoryModalOpen(false)
  }

  const deleteCategory = async (cat) => {
    const ok = window.confirm(`Tem certeza que deseja apagar "${cat.name}"?`)
    if (!ok) return
    await api.delete(`/categories/${cat._id}`)
    setCategorias((prev) => prev.filter((item) => item._id !== cat._id))
  }

  return (
    <section className="page">
      <div>
        <h1>Serviços</h1>
        <p className="page-subtitle">Catálogo completo com duração e preço.</p>
      </div>

      <div className="card" style={{ display: 'flex', gap: '1.5rem' }}>
        <aside style={{ minWidth: '220px', borderRight: '1px solid var(--stroke)', paddingRight: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Categorias</h3>
            <button className="btn" type="button" onClick={() => openCategoryModal()}>
              Nova
            </button>
          </div>
          <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.8rem' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </button>
            {categoryTree.map((cat) => (
              <div key={cat._id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSelectedCategory(cat.level === 0 ? cat._id : null)}
                  style={{ marginLeft: `${cat.depth * 8}px` }}
                >
                  {cat.name}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => openCategoryModal(cat)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => deleteCategory(cat)}
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div style={{ flex: 1, display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Serviços</h3>
            <button className="btn" type="button" onClick={openModal}>Adicionar serviço</button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            {gridItems.map((item) => (
              <div key={item._id} className="card" style={{ boxShadow: 'none' }}>
                <h3>{item.name}</h3>
                <p>EUR {Number(item.price || 0).toFixed(2)}</p>
                <p>{item.maxDurationMinutes || item.durationMinutes} min</p>
                <div style={{ marginTop: '0.7rem' }}>
                  <button className="btn" type="button" onClick={() => startEdit(item)}>
                    Editar serviço
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editing && (
            <div className="card">
              <h3>Editar serviço</h3>
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                <input
                  className="search"
                  placeholder="Nome"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                <input
                  className="search"
                  placeholder="Preço"
                  type="number"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                />
                <textarea
                  className="search"
                  rows="3"
                  placeholder="Descrição"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button className="btn" type="button" onClick={saveEdit}>
                    Salvar
                  </button>
                  <button className="btn" type="button" onClick={() => setEditing(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Novo serviço</h3>
              <button className="btn" type="button" onClick={() => setIsModalOpen(false)}>
                Fechar
              </button>
            </div>

            <div className="modal-grid">
              <div>
                <h4>Categorias</h4>
                <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.6rem' }}>
                  {categoriesLevel0.map((cat) => (
                    <div key={cat._id} className="category-pill">
                      <input
                        type="radio"
                        name="cat"
                        checked={newService.category === cat._id}
                        onChange={() =>
                          setNewService((prev) => ({
                            ...prev,
                            category: cat._id,
                            subcategory: '',
                            subcategory2: '',
                            subcategory3: '',
                          }))
                        }
                      />
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.8rem' }}>
                <input
                  className="search"
                  placeholder="Nome do serviço"
                  value={newService.name}
                  onChange={(e) => setNewService((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="search"
                  placeholder="Preço"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService((prev) => ({ ...prev, price: e.target.value }))}
                />
                <input
                  className="search"
                  placeholder="Duração (min)"
                  type="number"
                  value={newService.durationMinutes}
                  onChange={(e) =>
                    setNewService((prev) => ({ ...prev, durationMinutes: e.target.value }))
                  }
                />
                <textarea
                  className="search"
                  rows="3"
                  placeholder="Descrição"
                  value={newService.description}
                  onChange={(e) =>
                    setNewService((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                <select
                  className="search"
                  value={newService.subcategory}
                  onChange={(e) =>
                    setNewService((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                      subcategory2: '',
                      subcategory3: '',
                    }))
                  }
                >
                  <option value="">Subcategoria (nível 1)</option>
                  {(categoriesByParent.get(newService.category) || []).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  className="search"
                  value={newService.subcategory2}
                  onChange={(e) =>
                    setNewService((prev) => ({
                      ...prev,
                      subcategory2: e.target.value,
                      subcategory3: '',
                    }))
                  }
                >
                  <option value="">Subcategoria (nível 2)</option>
                  {(categoriesByParent.get(newService.subcategory) || []).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  className="search"
                  value={newService.subcategory3}
                  onChange={(e) =>
                    setNewService((prev) => ({
                      ...prev,
                      subcategory3: e.target.value,
                    }))
                  }
                >
                  <option value="">Subcategoria (nível 3)</option>
                  {(categoriesByParent.get(newService.subcategory2) || []).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button className="btn" type="button" onClick={saveNewService}>
                    Salvar
                  </button>
                  <button className="btn" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{categoryForm.id ? 'Editar categoria' : 'Nova categoria'}</h3>
              <button className="btn" type="button" onClick={() => setIsCategoryModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <input
                className="search"
                placeholder="Nome da categoria"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <select
                className="search"
                value={categoryForm.level}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    level: Number(e.target.value),
                    parent: '',
                  }))
                }
              >
                <option value={0}>Categoria (nível 0)</option>
                <option value={1}>Subcategoria (nível 1)</option>
                <option value={2}>Subcategoria 2 (nível 2)</option>
                <option value={3}>Subcategoria 3 (nível 3)</option>
              </select>
              {categoryForm.level > 0 && (
                <select
                  className="search"
                  value={categoryForm.parent}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, parent: e.target.value }))
                  }
                >
                  <option value="">Selecione o pai</option>
                  {categorias
                    .filter((cat) => cat.level === categoryForm.level - 1)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              )}
              {categoryError && (
                <p style={{ color: '#b12a5b', margin: 0 }}>{categoryError}</p>
              )}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn" type="button" onClick={saveCategory}>
                  Salvar
                </button>
                <button className="btn" type="button" onClick={() => setIsCategoryModalOpen(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminServicos
