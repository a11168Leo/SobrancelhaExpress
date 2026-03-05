
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiImage,
  FiPlus,
  FiSearch,
} from 'react-icons/fi'
import api, { API_BASE_URL } from '../api/api.js'




const getEntityId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') return value._id || value.id || ''
  return String(value)
}

const getDuration = (service) => Number(service.maxDurationMinutes || service.durationMinutes || 0)
const getImageUrl = (value) => {
  if (!value) return ''
  if (value.startsWith('http')) return value
  return `${API_BASE_URL}${value}`
}

function ServicesCatalogPage() {
  const carouselRef = useRef(null)




  const [servicos, setServicos] = useState([])
  const [categorias, setCategorias] = useState([])




  const [selectedCategory, setSelectedCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [onlyWithImage, setOnlyWithImage] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)




  const [editing, setEditing] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [serviceError, setServiceError] = useState('')
  const [uploadingImageId, setUploadingImageId] = useState('')
  const [newServiceImage, setNewServiceImage] = useState(null)
  const [newServiceImageName, setNewServiceImageName] = useState('')
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
      // ====================
      // Carrega servicos e estrutura de categorias em paralelo.
      // ====================
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

  const categoriesById = useMemo(() => {
    const map = new Map()
    for (const item of categorias) {
      map.set(item._id, item)
    }
    return map
  }, [categorias])

  const categoriesByParent = useMemo(() => {
    // ====================
    // Index por pai para facilitar selects em cascata.
    // ====================
    const map = new Map()
    for (const item of categorias) {
      const key = item.parent || 'root'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    }
    return map
  }, [categorias])

  const categoriesByLevel = useMemo(() => {
    // ====================
    // Separa exatamente como no banco: nivel 0..3.
    // ====================
    const byLevel = {
      0: [],
      1: [],
      2: [],
      3: [],
    }

    for (const item of categorias) {
      if (!Object.prototype.hasOwnProperty.call(byLevel, item.level)) continue
      byLevel[item.level].push(item)
    }

    for (const key of Object.keys(byLevel)) {
      byLevel[key].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'))
    }

    return byLevel
  }, [categorias])

  const formatCategoryPath = (service) => {
    const ids = [
      getEntityId(service.category),
      getEntityId(service.subcategory),
      getEntityId(service.subcategory2),
      getEntityId(service.subcategory3),
    ].filter(Boolean)

    const names = ids
      .map((id) => categoriesById.get(id)?.name)
      .filter(Boolean)

    return names.join(' / ')
  }

  const filtered = useMemo(() => {
    // ====================
    // Aplica todos os filtros da UI no catalogo.
    // ====================
    const term = search.trim().toLowerCase()
    const list = servicos.filter((item) => {
      const categoriesInService = [
        getEntityId(item.category),
        getEntityId(item.subcategory),
        getEntityId(item.subcategory2),
        getEntityId(item.subcategory3),
      ].filter(Boolean)

      if (selectedCategory && !categoriesInService.includes(selectedCategory)) return false
      if (statusFilter === 'active' && item.active === false) return false
      if (statusFilter === 'inactive' && item.active !== false) return false
      if (onlyWithImage && !item.imageUrl) return false
      if (!term) return true

      return (
        (item.name || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        formatCategoryPath(item).toLowerCase().includes(term)
      )
    })

    return list.sort((a, b) => {
      // ====================
      // Ordenacao dinamica pelo seletor do topo.
      // ====================
      const priceA = Number(a.price || 0)
      const priceB = Number(b.price || 0)
      const durationA = getDuration(a)
      const durationB = getDuration(b)

      if (sortBy === 'price-asc') return priceA - priceB
      if (sortBy === 'price-desc') return priceB - priceA
      if (sortBy === 'duration-asc') return durationA - durationB
      if (sortBy === 'duration-desc') return durationB - durationA

      return (a.name || '').localeCompare(b.name || '', 'pt-BR')
    })
  }, [servicos, selectedCategory, statusFilter, onlyWithImage, search, sortBy, categorias])

  const stats = useMemo(() => {
    const total = servicos.length
    const visible = filtered.length
    const withImage = servicos.filter((item) => Boolean(item.imageUrl)).length
    const avgPrice =
      total > 0
        ? servicos.reduce((sum, item) => sum + Number(item.price || 0), 0) / total
        : 0

    return {
      total,
      visible,
      withImage,
      avgPrice,
    }
  }, [servicos, filtered])

  const startEdit = (service) => {
    setServiceError('')
    setEditing({
      id: service._id,
      name: service.name || '',
      price: service.price || 0,
      description: service.description || '',
      durationMinutes: service.durationMinutes || 30,
      active: service.active !== false,
    })
  }

  const saveEdit = async () => {
    if (!editing) return

    const res = await api.patch(`/services/${editing.id}`, {
      name: editing.name,
      price: Number(editing.price),
      description: editing.description,
      durationMinutes: Number(editing.durationMinutes),
      active: Boolean(editing.active),
    })

    const updated = servicos.map((item) =>
      item._id === editing.id
        ? res.data.service
        : item
    )
    setServicos(updated)
    setEditing(null)
  }

  const deleteServiceFromEdit = async () => {
    // ====================
    // Exclui o servico somente dentro do fluxo de editar.
    // ====================
    if (!editing?.id) return

    const serviceName = editing.name || 'este servico'
    const ok = window.confirm(`Tem certeza que deseja apagar "${serviceName}"?`)
    if (!ok) return

    try {
      await api.delete(`/services/${editing.id}`)
      setServicos((prev) => prev.filter((item) => item._id !== editing.id))
      setEditing(null)
    } catch {
      setServiceError('Nao foi possivel excluir o servico.')
    }
  }

  const uploadServiceImage = async (serviceId, file, updateList = true) => {
    // ====================
    // Upload dedicado da imagem do servico.
    // ====================
    if (!file || !serviceId) return null

    setUploadingImageId(serviceId)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await api.post(`/services/${serviceId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (updateList) {
        setServicos((prev) =>
          prev.map((item) => (item._id === serviceId ? res.data.service : item))
        )
      }

      return res.data.service
    } finally {
      setUploadingImageId('')
    }
  }

  const openModal = () => {
    // ====================
    // Reseta o formulario de criacao.
    // ====================
    setServiceError('')
    setIsModalOpen(true)
    setNewServiceImage(null)
    setNewServiceImageName('')
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
    setServiceError('')

    if (!newService.name.trim()) {
      setServiceError('Nome do servico e obrigatorio.')
      return
    }
    if (!newService.category) {
      setServiceError('Selecione a categoria principal.')
      return
    }
    if (Number(newService.price) <= 0) {
      setServiceError('Informe um preco valido.')
      return
    }
    if (Number(newService.durationMinutes) <= 0) {
      setServiceError('Informe uma duracao valida.')
      return
    }

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

    try {
      // ====================
      // Cria primeiro o servico, depois tenta anexar imagem (se houver).
      // ====================
      const res = await api.post('/services', payload)

      let createdService = res.data.service
      if (newServiceImage && createdService?._id) {
        try {
          const imageUpdated = await uploadServiceImage(createdService._id, newServiceImage, false)
          if (imageUpdated) createdService = imageUpdated
        } catch {
          setServiceError('Servico criado, mas nao foi possivel enviar a imagem.')
        }
      }

      setServicos((prev) => [createdService, ...prev])
      setIsModalOpen(false)
    } catch {
      setServiceError('Nao foi possivel salvar o servico.')
    }
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
    // ====================
    // Valida e salva categoria/subcategoria de acordo com o nivel.
    // ====================
    if (!categoryForm.name.trim()) {
      setCategoryError('Nome da categoria e obrigatorio.')
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

  const deleteCategory = async (cat = null) => {
    // ====================
    // Exclui categoria via modal de edicao (ou fallback com item recebido).
    // ====================
    const categoryId = cat?._id || cat?.id || categoryForm.id
    const categoryName = cat?.name || categoryForm.name || 'esta categoria'
    if (!categoryId) return

    const ok = window.confirm(`Tem certeza que deseja apagar "${categoryName}"?`)
    if (!ok) return

    await api.delete(`/categories/${categoryId}`)
    setCategorias((prev) => prev.filter((item) => item._id !== categoryId))
    if (selectedCategory === categoryId) setSelectedCategory(null)
    setIsCategoryModalOpen(false)
  }

  const scrollCarousel = (direction) => {
    // ====================
    // Navegacao horizontal dos cards.
    // ====================
    if (!carouselRef.current) return
    const amount = direction === 'left' ? -320 : 320
    carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const resetFilters = () => {
    setSearchDraft('')
    setSearch('')
    setSortBy('name-asc')
    setStatusFilter('all')
    setOnlyWithImage(false)
  }

  const showAllServices = () => {
    // ====================
    // "Todas": limpa filtros e volta para visao completa.
    // ====================
    setSelectedCategory(null)
    resetFilters()
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchDraft)
  }

  const renderCategoryGroup = (level, title) => {
    // ====================
    // Mostra 3 itens por nivel para manter o bloco objetivo/compacto.
    // ====================
    const list = (categoriesByLevel[level] || []).slice(0, 3)

    return (
      <div className="category-group" key={title}>
        <h4>{title}</h4>
        {list.length === 0 ? (
          <p className="category-empty">Sem itens neste nivel.</p>
        ) : (
          <div className="category-group-list">
            {list.map((cat) => {
              const parentName = categoriesById.get(cat.parent)?.name || ''

              return (
                <div key={cat._id} className="category-row">
                  <button
                    type="button"
                    className={`btn${selectedCategory === cat._id ? ' is-active' : ''}`}
                    onClick={() => setSelectedCategory(cat._id)}
                  >
                    {cat.name}
                  </button>
                  {parentName && <span className="category-parent-pill">{parentName}</span>}
                  <button
                    type="button"
                    className="btn btn-ghost category-edit-btn"
                    onClick={() => openCategoryModal(cat)}
                  >
                    Editar
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <section className="page services-page">
      <div className="services-header">
        <div>
          <h1>Catalogo de servicos</h1>
          <p className="page-subtitle">Organize categorias, encontre rapido e edite com fluidez.</p>
        </div>
        <div className="services-header-stats">
          <div className="services-stat">
            <strong>{stats.total}</strong>
            <span>Total</span>
          </div>
          <div className="services-stat">
            <strong>{stats.visible}</strong>
            <span>Visiveis</span>
          </div>
          <div className="services-stat">
            <strong>{stats.withImage}</strong>
            <span>Com imagem</span>
          </div>
          <div className="services-stat">
            <strong>EUR {stats.avgPrice.toFixed(2)}</strong>
            <span>Preco medio</span>
          </div>
        </div>
      </div>

      <div className="card services-layout">
        <aside className="services-sidebar">
          {/* Sidebar de categorias por nivel (pai, sub1, sub2, sub3). */}
          <div className="services-sidebar-head">
            <h3>Categorias</h3>
            <button className="btn" type="button" onClick={() => openCategoryModal()}>
              Nova categoria
            </button>
          </div>

          <div className="category-tree">
            <p className="category-empty">Mostrando 3 itens por nivel.</p>
            <button
              type="button"
              className={`btn${!selectedCategory ? ' is-active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </button>
            <div className="category-groups">
              {renderCategoryGroup(0, 'Categorias (pai)')}
              {renderCategoryGroup(1, 'Subcategorias (nivel 1)')}
              {renderCategoryGroup(2, 'Subcategorias (nivel 2)')}
              {renderCategoryGroup(3, 'Subcategorias (nivel 3)')}
            </div>
          </div>
        </aside>

        <div className="services-main">
          {/* Linha principal: filtro no lado esquerdo e busca unica com lupa */}
          <div className="services-search-row">
            <button
              className={`btn btn-ghost services-filter-toggle${isFiltersOpen ? ' is-open' : ''}`}
              type="button"
              onClick={() => setIsFiltersOpen((prev) => !prev)}
            >
              <FiFilter />
              Filtros
            </button>
            <form className="services-search-form" onSubmit={handleSearchSubmit}>
              <input
                className="search services-search"
                type="search"
                placeholder="Buscar por nome, descricao ou categoria"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <button
                className="btn services-search-submit"
                type="submit"
                aria-label="Pesquisar servicos"
                title="Pesquisar servicos"
              >
                <FiSearch />
              </button>
            </form>
          </div>

          {/* Acoes explicitas para usuarios com mais dificuldade */}
          <div className="services-actions-row">
            <button className="btn btn-icon" type="button" onClick={openModal}>
              <FiPlus />
              Adicionar novo servico
            </button>
            <button className="btn btn-ghost btn-icon" type="button" onClick={() => openCategoryModal()}>
              <FiPlus />
              Nova categoria
            </button>
            <button className="btn btn-ghost" type="button" onClick={showAllServices}>
              Todas
            </button>
            <p className="services-toolbar-note">{filtered.length} resultado(s)</p>
          </div>

          {isFiltersOpen && (
            <>
              {/* Filtros avancados ficam recolhidos por padrao */}
              <div className="card services-filters-panel">
                <div className="services-filters-grid">
                  <select
                    className="search services-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name-asc">Nome (A-Z)</option>
                    <option value="price-asc">Preco (menor para maior)</option>
                    <option value="price-desc">Preco (maior para menor)</option>
                    <option value="duration-asc">Duracao (menor para maior)</option>
                    <option value="duration-desc">Duracao (maior para menor)</option>
                  </select>
                  <select
                    className="search services-sort"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos os status</option>
                    <option value="active">Somente ativos</option>
                    <option value="inactive">Somente inativos</option>
                  </select>
                  <label className="services-inline-check">
                    <input
                      type="checkbox"
                      checked={onlyWithImage}
                      onChange={(e) => setOnlyWithImage(e.target.checked)}
                    />
                    Somente servicos com imagem
                  </label>
                  <button className="btn btn-ghost" type="button" onClick={resetFilters}>
                    Limpar filtros
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Lista de servicos em carrossel horizontal com scroll discreto */}
          <div className="services-carousel-shell">
              <button
                className="services-scroll-btn"
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Deslizar para esquerda"
            >
              <FiChevronLeft />
            </button>

            <div className="services-carousel" ref={carouselRef}>
              <article
                className="card service-add-card"
                role="button"
                tabIndex={0}
                onClick={openModal}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openModal()
                  }
                }}
              >
                <div className="service-add-icon">
                  <FiPlus />
                </div>
                <strong>Adicionar novo servico</strong>
                <span>Clique para criar um servico e incluir imagem.</span>
              </article>

                {filtered.length === 0 && (
                  <article className="card service-empty-card">
                    <strong>Nenhum servico encontrado.</strong>
                  <span>Ajuste os filtros de busca, categoria ou status.</span>
                </article>
              )}

              {filtered.map((item) => (
                <article key={item._id} className="card service-card">
                  <div className="service-image-shell">
                    {item.imageUrl ? (
                      <img
                        className="service-image"
                        src={getImageUrl(item.imageUrl)}
                        alt={`Imagem do servico ${item.name}`}
                      />
                    ) : (
                      <div className="service-image-placeholder">
                        <FiImage />
                        <span>Sem imagem</span>
                      </div>
                    )}
                  </div>

                  <div className="service-card-head">
                    <h3>{item.name}</h3>
                    <span className="pill">EUR {Number(item.price || 0).toFixed(2)}</span>
                  </div>
                  <p className="service-card-description">
                    {item.description || 'Sem descricao detalhada para este servico.'}
                  </p>
                  <div className="service-meta">
                    <span>{getDuration(item)} min</span>
                    <span>{formatCategoryPath(item) || 'Sem categoria'}</span>
                  </div>
                  <div className="service-actions">
                    <button
                      className="btn btn-soft service-edit-btn"
                      type="button"
                      onClick={() => startEdit(item)}
                    >
                      Editar servico
                    </button>
                    <label className="btn btn-soft service-upload-btn">
                      {uploadingImageId === item._id ? 'Enviando...' : 'Imagem'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          try {
                            await uploadServiceImage(item._id, file)
                          } catch {
                            setServiceError('Nao foi possivel atualizar a imagem do servico.')
                          } finally {
                            e.target.value = ''
                          }
                        }}
                      />
                    </label>
                  </div>
                </article>
              ))}
          </div>

            <button
              className="services-scroll-btn"
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Deslizar para direita"
            >
              <FiChevronRight />
            </button>
          </div>

          {editing && (
            <>
              {/* Painel rapido de edicao do servico selecionado */}
              <div className="card services-edit-panel">
                <h3>Editar servico</h3>
                <div className="services-form-grid">
                  <input
                    className="search"
                    placeholder="Nome"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                  <input
                    className="search"
                    placeholder="Preco"
                    type="number"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                  />
                  <textarea
                    className="search"
                    rows="3"
                    placeholder="Descricao"
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                  <input
                    className="search"
                    placeholder="Duracao (min)"
                    type="number"
                    value={editing.durationMinutes}
                    onChange={(e) => setEditing({ ...editing, durationMinutes: e.target.value })}
                  />
                  <label className="services-inline-check">
                    <input
                      type="checkbox"
                      checked={Boolean(editing.active)}
                      onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                    />
                    Servico ativo
                  </label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button className="btn" type="button" onClick={saveEdit}>
                      Salvar
                    </button>
                    <button className="btn btn-danger" type="button" onClick={deleteServiceFromEdit}>
                      Excluir servico
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>
                      Cancelar
                    </button>
                  </div>
                  {serviceError && <p className="services-error">{serviceError}</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <>
          {/* Modal principal de criacao de servico */}
          <div className="salon-modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div className="salon-modal" onClick={(e) => e.stopPropagation()}>
              <div className="salon-modal-header">
                <h3>Novo servico</h3>
                <button className="btn btn-ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Fechar
                </button>
              </div>

            <div className="salon-modal-grid">
              <div>
                <h4>Categorias</h4>
                <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.6rem' }}>
                  {categoriesLevel0.map((cat) => (
                    <label key={cat._id} className="category-pill">
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
                    </label>
                  ))}
                </div>
              </div>

              <div className="services-form-grid">
                <input
                  className="search"
                  placeholder="Nome do servico"
                  value={newService.name}
                  onChange={(e) => setNewService((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="search"
                  placeholder="Preco"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService((prev) => ({ ...prev, price: e.target.value }))}
                />
                <input
                  className="search"
                  placeholder="Duracao (min)"
                  type="number"
                  value={newService.durationMinutes}
                  onChange={(e) =>
                    setNewService((prev) => ({ ...prev, durationMinutes: e.target.value }))
                  }
                />
                <textarea
                  className="search"
                  rows="3"
                  placeholder="Descricao"
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
                  <option value="">Subcategoria (nivel 1)</option>
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
                  <option value="">Subcategoria (nivel 2)</option>
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
                  <option value="">Subcategoria (nivel 3)</option>
                  {(categoriesByParent.get(newService.subcategory2) || []).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <label className="services-upload-field">
                  <span>Imagem do servico (opcional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setNewServiceImage(file)
                      setNewServiceImageName(file?.name || '')
                    }}
                  />
                  {newServiceImageName && <small>{newServiceImageName}</small>}
                </label>

                {serviceError && <p className="services-error">{serviceError}</p>}

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button className="btn" type="button" onClick={saveNewService}>
                    Salvar
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </>
      )}

      {isCategoryModalOpen && (
        <>
          {/* Modal de manutencao da arvore de categorias */}
          <div className="salon-modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
            <div className="salon-modal" onClick={(e) => e.stopPropagation()}>
              <div className="salon-modal-header">
                <h3>{categoryForm.id ? 'Editar categoria' : 'Nova categoria'}</h3>
                <button className="btn btn-ghost" type="button" onClick={() => setIsCategoryModalOpen(false)}>
                  Fechar
                </button>
              </div>
            <div className="services-form-grid">
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
                <option value={0}>Categoria (nivel 0)</option>
                <option value={1}>Subcategoria (nivel 1)</option>
                <option value={2}>Subcategoria 2 (nivel 2)</option>
                <option value={3}>Subcategoria 3 (nivel 3)</option>
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
              {categoryError && <p className="services-error">{categoryError}</p>}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button className="btn" type="button" onClick={saveCategory}>
                  Salvar
                </button>
                {categoryForm.id && (
                  <button className="btn btn-danger" type="button" onClick={() => deleteCategory()}>
                    Excluir categoria
                  </button>
                )}
                <button className="btn btn-ghost" type="button" onClick={() => setIsCategoryModalOpen(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}
    </section>
  )
}

export default ServicesCatalogPage





