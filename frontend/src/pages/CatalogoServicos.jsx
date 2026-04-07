/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/CATALOGOSERVICOS.JSX */
/* ======================================== */

// Importacoes
import { useState, useMemo, useEffect } from 'react'
import '../styles/pages/CatalogoServicos.css'
import { fetchJson } from '../services/api'

// Bloco: EMPTY_SERVICE_FORM
const EMPTY_SERVICE_FORM = {
  name: '',
  description: '',
  price: '',
  durationMinutes: '',
  bufferMinutes: '10',
  category: '',
  subcategory: '',
  subcategory2: '',
  subcategory3: '',
  imageUrl: '',
}

// Bloco: EMPTY_CATEGORY_FORM
const EMPTY_CATEGORY_FORM = {
  name: '',
  level: '0',
  parentCategory: '',
  parentSubcategory: '',
  parentSubcategory2: '',
}

// Funcao: CatalogoServicos
function CatalogoServicos() {

// Estado do componente
  const [categorias, setCategorias] = useState([])
  const [servicos, setServicos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isAddServiceVisible, setIsAddServiceVisible] = useState(false)
  const [panelSection, setPanelSection] = useState('service')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE_FORM)
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM)
  const [categorySubmitting, setCategorySubmitting] = useState(false)
  const [categoryError, setCategoryError] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [categoriesData, servicesData] = await Promise.all([
          fetchJson('/categories'),
          fetchJson('/services'),
        ])

        const categoriesList = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || []
        const servicesList = Array.isArray(servicesData) ? servicesData : servicesData?.services || []

        setCategorias(categoriesList)
        setServicos(servicesList.map((service) => ({
          ...service,
          nome: service.name ?? service.nome ?? 'Sem nome',
          duracao: `${service.durationMinutes ?? service.duration ?? 'N/A'} min`,
          preco: service.price !== undefined ? `${service.price} EUR` : service.preco ?? 'N/A',
          categoriaId: service.category ?? service.categoryId ?? service.categoriaId ?? null,
        })))
        setSelectedCategory((prev) => prev || (categoriesList[0]?._id ?? categoriesList[0]?.id ?? null))
        setError(null)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!isAddServiceOpen) {
      return undefined
    }

    const enterTimer = window.setTimeout(() => {
      setIsAddServiceVisible(true)
    }, 20)

// Manipuladores de eventos
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAddServicePanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(enterTimer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAddServiceOpen])

  const normalizedCategories = useMemo(
    () =>
      categorias.map((categoria) => ({
        ...categoria,
        id: String(categoria._id ?? categoria.id),
        label: categoria.name ?? categoria.nome ?? 'Sem nome',
        level: Number(categoria.level ?? 0),
        parentId: categoria.parent?._id ?? categoria.parent?.id ?? categoria.parent ?? null,
      })),
    [categorias],
  )

  const topLevelCategories = useMemo(
    () => normalizedCategories.filter((categoria) => categoria.level === 0),
    [normalizedCategories],
  )

  const getChildrenByParent = (parentId) =>
    normalizedCategories.filter((categoria) => String(categoria.parentId ?? '') === String(parentId ?? ''))

  const serviceLevel1Options = useMemo(
    () => getChildrenByParent(serviceForm.category),
    [normalizedCategories, serviceForm.category],
  )

  const serviceLevel2Options = useMemo(
    () => getChildrenByParent(serviceForm.subcategory),
    [normalizedCategories, serviceForm.subcategory],
  )

  const serviceLevel3Options = useMemo(
    () => getChildrenByParent(serviceForm.subcategory2),
    [normalizedCategories, serviceForm.subcategory2],
  )

  const categoryLevel1Options = useMemo(
    () => getChildrenByParent(categoryForm.parentCategory),
    [normalizedCategories, categoryForm.parentCategory],
  )

  const categoryLevel2Options = useMemo(
    () => getChildrenByParent(categoryForm.parentSubcategory),
    [normalizedCategories, categoryForm.parentSubcategory],
  )

  const servicosPorCategoria = useMemo(() => {
    const mapa = {}

    topLevelCategories.forEach((categoria) => {
      const catId = categoria.id
      mapa[catId] = {
        categoria,
        servicos: servicos.filter((servico) => String(servico.categoriaId ?? servico.categoryId) === catId),
      }
    })

    return mapa
  }, [topLevelCategories, servicos])

  const servicosFiltrados = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()
    const resultado = {}

    Object.entries(servicosPorCategoria).forEach(([catId, { categoria, servicos: servs }]) => {
      if (selectedCategory && catId !== String(selectedCategory)) {
        return
      }

      const encontrados = servs.filter((servico) => {
        const name = (servico.nome ?? servico.name ?? '').toString().toLowerCase()
        return normalizedSearch === '' || name.includes(normalizedSearch)
      })

      if (encontrados.length > 0) {
        resultado[catId] = {
          categoria,
          servicos: encontrados,
        }
      }
    })

    return resultado
  }, [searchTerm, selectedCategory, servicosPorCategoria])

  const openAddServicePanel = () => {
    const firstTopLevelCategory = topLevelCategories[0]?.id ?? ''
    setPanelSection('service')
    setFormError(null)
    setCategoryError(null)
    setServiceForm({
      ...EMPTY_SERVICE_FORM,
      category: firstTopLevelCategory,
    })
    setCategoryForm(EMPTY_CATEGORY_FORM)
    setIsAddServiceOpen(true)
  }

  const closeAddServicePanel = () => {
    setIsAddServiceVisible(false)
    window.setTimeout(() => {
      setIsAddServiceOpen(false)
      setFormError(null)
      setCategoryError(null)
      setIsSubmitting(false)
      setCategorySubmitting(false)
    }, 320)
  }

  const switchPanelSection = (section) => {
    setPanelSection(section)
    setFormError(null)
    setCategoryError(null)
  }

  const handleServiceFormChange = (event) => {
    const { name, value } = event.target
    setServiceForm((current) => {
      if (name === 'subcategory') {
        return { ...current, subcategory: value, subcategory2: '', subcategory3: '' }
      }
      if (name === 'subcategory2') {
        return { ...current, subcategory2: value, subcategory3: '' }
      }
      return { ...current, [name]: value }
    })
  }

  const handleTopLevelCategorySelect = (categoryId) => {
    setServiceForm((current) => ({
      ...current,
      category: categoryId,
      subcategory: '',
      subcategory2: '',
      subcategory3: '',
    }))
  }

  const handleCategoryLevelChange = (level) => {
    setCategoryForm((current) => ({
      ...current,
      level,
      parentCategory: '',
      parentSubcategory: '',
      parentSubcategory2: '',
    }))
  }

  const handleCategoryFormChange = (event) => {
    const { name, value } = event.target
    setCategoryForm((current) => {
      if (name === 'parentCategory') {
        return { ...current, parentCategory: value, parentSubcategory: '', parentSubcategory2: '' }
      }
      if (name === 'parentSubcategory') {
        return { ...current, parentSubcategory: value, parentSubcategory2: '' }
      }
      return { ...current, [name]: value }
    })
  }

  const handleMenuToggle = (servicoId) => {
    setActiveMenu(activeMenu === servicoId ? null : servicoId)
  }

  const handleMenuAction = (action, servicoId) => {
    console.log(`Acao: ${action}, Servico ID: ${servicoId}`)
    setActiveMenu(null)
  }

  const handleCreateService = async (event) => {
    event.preventDefault()

    if (!serviceForm.name.trim() || !serviceForm.price || !serviceForm.durationMinutes || !serviceForm.category) {
      setFormError('Preencha nome, preco, duracao e escolha a categoria pai.')
      return
    }

    const parsedDuration = Number(serviceForm.durationMinutes)
    const parsedBuffer = Number(serviceForm.bufferMinutes || 0)

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setFormError('Informe uma duracao valida para o servico.')
      return
    }

    if (!Number.isFinite(parsedBuffer) || parsedBuffer < 0) {
      setFormError('Informe um intervalo valido em minutos.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      const response = await fetchJson('/services/public', {
        method: 'POST',
        body: JSON.stringify({
          name: serviceForm.name.trim(),
          description: serviceForm.description.trim(),
          price: Number(serviceForm.price),
          durationMinutes: parsedDuration,
          maxDurationMinutes: parsedDuration + parsedBuffer,
          category: serviceForm.category,
          subcategory: serviceForm.subcategory || undefined,
          subcategory2: serviceForm.subcategory2 || undefined,
          subcategory3: serviceForm.subcategory3 || undefined,
          imageUrl: serviceForm.imageUrl.trim() || undefined,
        }),
      })

      const service = response?.service ?? response
      const normalizedService = {
        ...service,
        nome: service.name ?? service.nome ?? serviceForm.name.trim(),
        duracao: `${service.durationMinutes ?? service.duration ?? serviceForm.durationMinutes} min`,
        preco: service.price !== undefined ? `${service.price} EUR` : `${serviceForm.price} EUR`,
        categoriaId: service.category ?? service.categoryId ?? service.categoriaId ?? serviceForm.category,
      }

      setServicos((current) =>
        [...current, normalizedService].sort((first, second) =>
          (first.nome ?? '').toString().localeCompare((second.nome ?? '').toString()),
        ),
      )
      setSelectedCategory(serviceForm.category)
      setSearchTerm('')
      closeAddServicePanel()
    } catch (submitError) {
      setFormError(submitError.message)
      setIsSubmitting(false)
    }
  }

  const handleCreateCategory = async (event) => {
    event.preventDefault()

    const level = Number(categoryForm.level)
    let parentId = null

    if (level === 1) parentId = categoryForm.parentCategory
    if (level === 2) parentId = categoryForm.parentSubcategory
    if (level === 3) parentId = categoryForm.parentSubcategory2

    if (!categoryForm.name.trim()) {
      setCategoryError('Informe o nome da categoria.')
      return
    }

    if (level > 0 && !parentId) {
      setCategoryError('Escolha a categoria pai correta para esse nivel.')
      return
    }

    setCategorySubmitting(true)
    setCategoryError(null)

    try {
      const response = await fetchJson('/categories/public', {
        method: 'POST',
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          level,
          parentId: parentId || undefined,
        }),
      })

      const category = response?.category ?? response
      const normalizedCategory = {
        ...category,
        id: String(category._id ?? category.id),
        label: category.name ?? category.nome ?? categoryForm.name.trim(),
        level: Number(category.level ?? level),
        parentId: category.parent?._id ?? category.parent?.id ?? category.parent ?? parentId ?? null,
      }

      setCategorias((current) =>
        [...current, normalizedCategory].sort((first, second) =>
          (first.name ?? first.label ?? '').toString().localeCompare((second.name ?? second.label ?? '').toString()),
        ),
      )

      if (normalizedCategory.level === 0) {
        setSelectedCategory(normalizedCategory.id)
        setServiceForm((current) => ({
          ...current,
          category: normalizedCategory.id,
          subcategory: '',
          subcategory2: '',
          subcategory3: '',
        }))
      }

      setCategorySubmitting(false)
      setCategoryError(null)
      setCategoryForm(EMPTY_CATEGORY_FORM)
      setPanelSection('service')
    } catch (submitError) {
      setCategoryError(submitError.message)
      setCategorySubmitting(false)
    }
  }

  if (loading) {

// Renderizacao principal
    return (
      <section className="catalog-page">
        <div className="catalog-header">
          <h1>Carregando catalogo...</h1>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="catalog-page">
        <div className="catalog-header">
          <h1>Erro ao carregar catalogo</h1>
          <p>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <h1>Catalogo de servicos</h1>
          <p>Visualize e gerencie os servicos conectados a base de dados</p>
        </div>
        <button className="catalog-add-service-button" type="button" onClick={openAddServicePanel}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
          </svg>
          <span>Adicionar</span>
        </button>
      </div>

      <div className="catalog-toolbar">
        <label className="search-box" htmlFor="catalog-search">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
          <input
            id="catalog-search"
            type="search"
            placeholder="Pesquisar servicos"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <button className="filter-button" type="button" aria-label="Filtros">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z" />
          </svg>
        </button>
      </div>

      <div className="categories-scroll">
        <nav className="categories-nav">
          {topLevelCategories.map((categoria) => {
            const catId = categoria.id
            const count = servicosPorCategoria[catId]?.servicos.length || 0

            return (
              <button
                key={catId}
                type="button"
                className={`category-chip ${String(selectedCategory) === catId ? 'active' : ''}`}
                onClick={() => setSelectedCategory(catId)}
              >
                <span className="category-name">{categoria.label}</span>
                <span className="category-count">{count}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="services-list">
        {Object.entries(servicosFiltrados).length === 0 ? (
          <div className="empty-state">
            <p>Nenhum servico encontrado</p>
          </div>
        ) : (
          Object.entries(servicosFiltrados).map(([catId, { categoria, servicos: servs }]) => (
            <div key={catId} className="category-section">
              <h2 className="category-title">{categoria.label}</h2>

              {servs.map((servico) => (
                <div key={servico._id ?? servico.id} className="service-item">
                  <div className="service-info">
                    <h3>{servico.nome}</h3>
                    <div className="service-details">
                      <span className="duration">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {servico.duracao}
                      </span>
                      <span className="price">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        {servico.preco}
                      </span>
                    </div>
                  </div>

                  <div className="service-actions">
                    <button
                      type="button"
                      className="menu-button"
                      onClick={() => handleMenuToggle(servico._id ?? servico.id)}
                      aria-label="Opcoes do servico"
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <circle cx="2" cy="8" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="14" cy="8" r="1.5" />
                      </svg>
                    </button>

                    {activeMenu === (servico._id ?? servico.id) && (
                      <div className="context-menu">
                        <button type="button" className="menu-item" onClick={() => handleMenuAction('editar', servico._id ?? servico.id)}>
                          Editar
                        </button>
                        <button type="button" className="menu-item" onClick={() => handleMenuAction('adicionar', servico._id ?? servico.id)}>
                          Adicionar servico
                        </button>
                        <button type="button" className="menu-item" onClick={() => handleMenuAction('arquivar', servico._id ?? servico.id)}>
                          Arquivar
                        </button>
                        <button type="button" className="menu-item delete" onClick={() => handleMenuAction('excluir', servico._id ?? servico.id)}>
                          Excluir permanentemente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {isAddServiceOpen && (
        <div className={`add-service-sheet-backdrop ${isAddServiceVisible ? 'is-visible' : ''}`} onClick={closeAddServicePanel}>
          <section
            className={`add-service-sheet ${isAddServiceVisible ? 'is-visible' : ''}`}
            onClick={(event) => event.stopPropagation()}
            aria-label="Adicionar novo servico"
          >
            <div className="add-service-sheet-handle" />

            <div className="add-service-sheet-header">
              <div>
                <h2>Novo cadastro</h2>
                <p>Crie um novo servico ou organize as categorias antes de salvar.</p>
              </div>

              <button type="button" className="add-service-close" onClick={closeAddServicePanel} aria-label="Fechar">
                x
              </button>
            </div>

            <div className="panel-tabbar" role="tablist" aria-label="Tipos de cadastro">
              <button
                type="button"
                className={`panel-tab ${panelSection === 'service' ? 'active' : ''}`}
                onClick={() => switchPanelSection('service')}
              >
                Servico
              </button>
              <button
                type="button"
                className={`panel-tab ${panelSection === 'category' ? 'active' : ''}`}
                onClick={() => switchPanelSection('category')}
              >
                Categorias
              </button>
            </div>

            {panelSection === 'service' ? (
              <form className="add-service-form" onSubmit={handleCreateService}>
                <div className="panel-section-header">
                  <h3>Escolha a categoria pai</h3>
                  <p>Mostramos apenas as categorias principais aqui. Os niveis abaixo aparecem em dropdown.</p>
                </div>

                <div className="parent-category-nav">
                  {topLevelCategories.map((categoria) => (
                    <button
                      key={categoria.id}
                      type="button"
                      className={`parent-category-pill ${serviceForm.category === categoria.id ? 'active' : ''}`}
                      onClick={() => handleTopLevelCategorySelect(categoria.id)}
                    >
                      {categoria.label}
                    </button>
                  ))}
                </div>

                <div className="add-service-grid">
                  <label className="add-service-field">
                    <span>Subcategoria</span>
                    <select name="subcategory" value={serviceForm.subcategory} onChange={handleServiceFormChange}>
                      <option value="">Selecione se existir</option>
                      {serviceLevel1Options.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="add-service-field">
                    <span>Subcategoria 2</span>
                    <select
                      name="subcategory2"
                      value={serviceForm.subcategory2}
                      onChange={handleServiceFormChange}
                      disabled={!serviceForm.subcategory}
                    >
                      <option value="">Selecione se existir</option>
                      {serviceLevel2Options.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="add-service-field">
                  <span>Subcategoria 3</span>
                  <select
                    name="subcategory3"
                    value={serviceForm.subcategory3}
                    onChange={handleServiceFormChange}
                    disabled={!serviceForm.subcategory2}
                  >
                    <option value="">Selecione se existir</option>
                    {serviceLevel3Options.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="add-service-field">
                  <span>Nome do servico</span>
                  <input type="text" name="name" value={serviceForm.name} onChange={handleServiceFormChange} />
                </label>

                <label className="add-service-field">
                  <span>Descricao</span>
                  <textarea name="description" rows="4" value={serviceForm.description} onChange={handleServiceFormChange} />
                </label>

                <div className="add-service-grid">
                  <label className="add-service-field">
                    <span>Preco</span>
                    <input type="number" min="0" step="0.01" name="price" value={serviceForm.price} onChange={handleServiceFormChange} />
                  </label>

                  <label className="add-service-field">
                    <span>Duracao em minutos</span>
                    <input type="number" min="1" step="1" name="durationMinutes" value={serviceForm.durationMinutes} onChange={handleServiceFormChange} />
                  </label>
                </div>

                <div className="add-service-grid">
                  <label className="add-service-field">
                    <span>Intervalo entre atendimentos</span>
                    <input type="number" min="0" step="1" name="bufferMinutes" value={serviceForm.bufferMinutes} onChange={handleServiceFormChange} />
                  </label>

                  <div className="add-service-insight">
                    <span>Resumo da agenda</span>
                    <strong>
                      {(Number(serviceForm.durationMinutes) || 0) + (Number(serviceForm.bufferMinutes) || 0)} min bloqueados
                    </strong>
                    <p>
                      {Number(serviceForm.durationMinutes) || 0} min de atendimento + {Number(serviceForm.bufferMinutes) || 0} min de intervalo.
                    </p>
                  </div>
                </div>

                <label className="add-service-field">
                  <span>Foto do servico</span>
                  <input type="url" name="imageUrl" placeholder="Cole a URL da foto" value={serviceForm.imageUrl} onChange={handleServiceFormChange} />
                </label>

                {serviceForm.imageUrl.trim() && (
                  <div className="add-service-image-preview">
                    <span>Pre-visualizacao da foto</span>
                    <img src={serviceForm.imageUrl} alt="Pre-visualizacao do servico" />
                  </div>
                )}

                {formError && <p className="add-service-feedback">{formError}</p>}

                <div className="add-service-actions">
                  <button type="button" className="add-service-secondary" onClick={() => switchPanelSection('category')}>
                    Criar nova categoria
                  </button>
                  <button type="submit" className="add-service-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Criando...' : 'Criar servico'}
                  </button>
                </div>
              </form>
            ) : (
              <form className="add-service-form" onSubmit={handleCreateCategory}>
                <div className="panel-section-header">
                  <h3>Criar categoria</h3>
                  <p>Escolha o nivel da nova categoria e defina a hierarquia necessaria.</p>
                </div>

                <div className="level-tabbar">
                  {[
                    { value: '0', label: 'Categoria pai' },
                    { value: '1', label: 'Subcategoria' },
                    { value: '2', label: 'Subcategoria 2' },
                    { value: '3', label: 'Subcategoria 3' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`level-tab ${categoryForm.level === item.value ? 'active' : ''}`}
                      onClick={() => handleCategoryLevelChange(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {Number(categoryForm.level) > 0 && (
                  <div className="parent-category-nav">
                    {topLevelCategories.map((categoria) => (
                      <button
                        key={categoria.id}
                        type="button"
                        className={`parent-category-pill ${categoryForm.parentCategory === categoria.id ? 'active' : ''}`}
                        onClick={() =>
                          handleCategoryFormChange({
                            target: { name: 'parentCategory', value: categoria.id },
                          })
                        }
                      >
                        {categoria.label}
                      </button>
                    ))}
                  </div>
                )}

                {Number(categoryForm.level) >= 2 && (
                  <label className="add-service-field">
                    <span>Escolha a subcategoria pai</span>
                    <select name="parentSubcategory" value={categoryForm.parentSubcategory} onChange={handleCategoryFormChange}>
                      <option value="">Selecione</option>
                      {categoryLevel1Options.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {Number(categoryForm.level) >= 3 && (
                  <label className="add-service-field">
                    <span>Escolha a subcategoria 2 pai</span>
                    <select name="parentSubcategory2" value={categoryForm.parentSubcategory2} onChange={handleCategoryFormChange}>
                      <option value="">Selecione</option>
                      {categoryLevel2Options.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="add-service-field">
                  <span>Nome da categoria</span>
                  <input type="text" name="name" value={categoryForm.name} onChange={handleCategoryFormChange} />
                </label>

                {categoryError && <p className="add-service-feedback">{categoryError}</p>}

                <div className="add-service-actions">
                  <button type="button" className="add-service-secondary" onClick={() => switchPanelSection('service')}>
                    Voltar para servico
                  </button>
                  <button type="submit" className="add-service-primary" disabled={categorySubmitting}>
                    {categorySubmitting ? 'Criando...' : 'Criar categoria'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

// Exportacao principal
export default CatalogoServicos
