import axios from 'axios'

interface KomgaConfig {
  url: string
  username: string
  password: string
  apiKey: string
  authenticated: boolean
}

let config: KomgaConfig = {
  url: '',
  username: '',
  password: '',
  apiKey: '',
  authenticated: false,
}

const komgaClient = axios.create({
  params: undefined,
})

export function setKomgaConfig(newConfig: KomgaConfig) {
  config = newConfig
}

export async function authenticate(username: string, password: string, apiKey?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey
    } else if (username && password) {
      const auth = btoa(`${username}:${password}`)
      headers['Authorization'] = `Basic ${auth}`
    } else {
      return false
    }
    
    const response = await komgaClient.post(`${config.url}/api/v1/series/list`, {
      page: 0,
      size: 1,
    }, {
      headers,
      params: undefined,
    })
    
    if (response.status === 200) {
      config = {
        url: config.url,
        username,
        password,
        apiKey: apiKey || '',
        authenticated: true,
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Komga authentication error:', error)
    return false
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey
  } else if (config.username && config.password) {
    const auth = btoa(`${config.username}:${config.password}`)
    headers['Authorization'] = `Basic ${auth}`
  }
  
  return headers
}

export async function getSeries(page = 0, pageSize = 50): Promise<any[]> {
  const response = await komgaClient.post(`${config.url}/api/v1/series/list`, {
    page,
    size: pageSize,
  }, {
    headers: getAuthHeaders(),
    params: undefined,
  })
  return response.data.content || []
}

export async function getSeriesById(id: string): Promise<any | undefined> {
  const response = await komgaClient.get(`${config.url}/api/v1/series/${id}`, {
    headers: getAuthHeaders(),
    params: undefined,
  })
  return response.data
}

export async function getBooks(page = 0, pageSize = 50, seriesId?: string): Promise<any[]> {
  const body: Record<string, any> = {
    page,
    size: pageSize,
  }
  
  if (seriesId) {
    body.seriesId = seriesId
  }
  
  const response = await komgaClient.post(`${config.url}/api/v1/books/list`, body, {
    headers: getAuthHeaders(),
    params: undefined,
  })
  return response.data.content || []
}

export async function getBookById(id: string): Promise<any | undefined> {
  const response = await komgaClient.get(`${config.url}/api/v1/books/${id}`, {
    headers: getAuthHeaders(),
    params: undefined,
  })
  return response.data
}

export async function getCollections(): Promise<any[]> {
  const response = await komgaClient.get(`${config.url}/api/v1/collections`, {
    headers: getAuthHeaders(),
    params: undefined,
  })
  return response.data || []
}

export async function getSeriesThumbnailBlob(seriesId: string): Promise<string> {
  if (!config.url) {
    console.error('Komga config URL is empty')
    return ''
  }
  
  try {
    const url = `${config.url}/api/v1/series/${seriesId}/thumbnail`
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      console.error('Failed to fetch series thumbnail:', response.status)
      return ''
    }
    
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error fetching series thumbnail:', error)
    return ''
  }
}

export async function getBookThumbnailBlob(bookId: string): Promise<string> {
  if (!config.url) {
    return ''
  }
  
  try {
    const url = `${config.url}/api/v1/books/${bookId}/thumbnail`
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      return ''
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      return ''
    }
    
    const blob = await response.blob()
    if (blob.size === 0) {
      return ''
    }
    
    return URL.createObjectURL(blob)
  } catch {
    return ''
  }
}

export function getSeriesThumbnailUrl(seriesId: string): string {
  if (!config.url) {
    console.error('Komga config URL is empty')
    return ''
  }
  const baseUrl = `${config.url}/api/v1/series/${seriesId}/thumbnail`
  return addAuthToUrl(baseUrl)
}

export function getBookThumbnailUrl(bookId: string): string {
  if (!config.url) {
    console.error('Komga config URL is empty')
    return ''
  }
  const baseUrl = `${config.url}/api/v1/books/${bookId}/thumbnail`
  return addAuthToUrl(baseUrl)
}

export function getBookPageUrl(bookId: string, pageNumber: number): string {
  if (!config.url) {
    console.error('Komga config URL is empty')
    return ''
  }
  const baseUrl = `${config.url}/api/v1/books/${bookId}/pages/${pageNumber}`
  return addAuthToUrl(baseUrl)
}

export function getBookPageThumbnailUrl(bookId: string, pageNumber: number): string {
  if (!config.url) {
    console.error('Komga config URL is empty')
    return ''
  }
  const baseUrl = `${config.url}/api/v1/books/${bookId}/pages/${pageNumber}/thumbnail`
  return addAuthToUrl(baseUrl)
}

function addAuthToUrl(url: string): string {
  if (!config.url) {
    return url
  }
  
  try {
    const urlObj = new URL(url)
    
    if (config.apiKey) {
      urlObj.searchParams.set('apiKey', config.apiKey)
    } else if (config.username && config.password) {
      urlObj.username = encodeURIComponent(config.username)
      urlObj.password = encodeURIComponent(config.password)
    }
    
    return urlObj.toString()
  } catch (e) {
    console.error('Failed to add auth to URL:', e)
    return url
  }
}

export function getCurrentConfig(): KomgaConfig {
  return { ...config }
}

export async function getLibraries(): Promise<any[]> {
  const response = await komgaClient.get(`${config.url}/api/v1/libraries`, {
    headers: getAuthHeaders(),
    params: undefined,
  })
  return response.data || []
}

export async function getBookPages(bookId: string): Promise<any[]> {
  const response = await komgaClient.get(`${config.url}/api/v1/books/${bookId}/pages`, {
    headers: getAuthHeaders(),
    params: undefined,
  })
  return response.data || []
}

export async function getBookByIdWithPages(bookId: string): Promise<any | undefined> {
  const [book, pages] = await Promise.all([
    getBookById(bookId),
    getBookPages(bookId),
  ])
  if (book) {
    book.pages = pages
  }
  return book
}