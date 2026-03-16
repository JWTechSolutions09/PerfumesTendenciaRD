'use client'

import { useState, useMemo } from 'react'
import { Product, FilterState, Gender, FragranceType, Availability } from '@/types'

const initialFilters: FilterState = {
  search: '',
  brand: [],
  priceRange: [0, 200000],
  gender: [],
  fragranceType: [],
  availability: [],
}

export function useFilters(products: Product[]) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Búsqueda por texto
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.gender.toLowerCase().includes(searchLower) ||
          product.olfactoryNotes.some((note) =>
            note.toLowerCase().includes(searchLower)
          )
        
        if (!matchesSearch) return false
      }

      // Filtro por marca
      if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
        return false
      }

      // Filtro por precio
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false
      }

      // Filtro por género
      if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) {
        return false
      }

      // Filtro por tipo de fragancia
      if (
        filters.fragranceType.length > 0 &&
        !filters.fragranceType.includes(product.fragranceType)
      ) {
        return false
      }

      // Filtro por disponibilidad
      if (
        filters.availability.length > 0 &&
        !filters.availability.includes(product.availability)
      ) {
        return false
      }

      return true
    })
  }, [products, filters])

  const updateSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  const toggleBrand = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brand: prev.brand.includes(brand)
        ? prev.brand.filter((b) => b !== brand)
        : [...prev.brand, brand],
    }))
  }

  const updatePriceRange = (range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }))
  }

  const toggleGender = (gender: Gender) => {
    setFilters((prev) => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter((g) => g !== gender)
        : [...prev.gender, gender],
    }))
  }

  const toggleFragranceType = (type: FragranceType) => {
    setFilters((prev) => ({
      ...prev,
      fragranceType: prev.fragranceType.includes(type)
        ? prev.fragranceType.filter((t) => t !== type)
        : [...prev.fragranceType, type],
    }))
  }

  const toggleAvailability = (availability: Availability) => {
    setFilters((prev) => ({
      ...prev,
      availability: prev.availability.includes(availability)
        ? prev.availability.filter((a) => a !== availability)
        : [...prev.availability, availability],
    }))
  }

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.brand.length > 0 ||
      filters.priceRange[0] !== initialFilters.priceRange[0] ||
      filters.priceRange[1] !== initialFilters.priceRange[1] ||
      filters.gender.length > 0 ||
      filters.fragranceType.length > 0 ||
      filters.availability.length > 0
    )
  }

  return {
    filters,
    filteredProducts,
    updateSearch,
    toggleBrand,
    updatePriceRange,
    toggleGender,
    toggleFragranceType,
    toggleAvailability,
    clearFilters,
    hasActiveFilters,
  }
}
