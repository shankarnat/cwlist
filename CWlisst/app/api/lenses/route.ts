import { NextResponse } from 'next/server'
import { Lens } from '@/types/lens'

const initialLenses: Lens[] = [
  {
    id: 'LENS001',
    name: 'Product Insights Dashboard',
    status: 'Published',
    desc: 'Comprehensive view of product performance metrics',
    lastRefreshed: new Date().toLocaleString()
  },
  {
    id: 'LENS002',
    name: 'Customer Engagement Analytics',
    status: 'Draft',
    desc: 'Track customer interactions and engagement patterns',
    lastRefreshed: new Date().toLocaleString()
  },
  {
    id: 'LENS003',
    name: 'Sales Performance Tracker',
    status: 'Published',
    desc: 'Monitor sales team performance and pipeline health',
    lastRefreshed: new Date().toLocaleString()
  }
]

// In-memory storage (in production, use a database)
let lenses = [...initialLenses]

export async function GET() {
  return NextResponse.json(lenses)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newLens: Lens = {
      id: body.id || `LENS${String(lenses.length + 1).padStart(3, '0')}`,
      name: body.name,
      status: body.status || 'Draft',
      desc: body.description || body.desc || '',
      lastRefreshed: new Date().toLocaleString()
    }
    
    lenses.push(newLens)
    return NextResponse.json(newLens, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const lensIndex = lenses.findIndex(lens => lens.id === id)
    if (lensIndex === -1) {
      return NextResponse.json({ error: 'Lens not found' }, { status: 404 })
    }
    
    lenses[lensIndex] = { ...lenses[lensIndex], ...updates }
    return NextResponse.json(lenses[lensIndex])
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    const lensIndex = lenses.findIndex(lens => lens.id === id)
    if (lensIndex === -1) {
      return NextResponse.json({ error: 'Lens not found' }, { status: 404 })
    }
    
    const deletedLens = lenses.splice(lensIndex, 1)[0]
    return NextResponse.json(deletedLens)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}