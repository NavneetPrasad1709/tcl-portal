import { createClient } from '@supabase/supabase-js'

const MOCK_SHOPIFY_PRODUCTS = [
  {
    sku: 'TEE-GILDAN-5000',
    title: 'Gildan 5000 Heavy Cotton Tee',
    category: 'T-Shirts',
    turnaround_days: 10,
    starting_price: 8.50,
    is_featured: true,
    print_types_available: ['screen_print', 'puff_print', 'foil'],
  },
  {
    sku: 'TEE-BELLA-3001',
    title: 'Bella+Canvas 3001 Unisex Tee',
    category: 'T-Shirts',
    turnaround_days: 10,
    starting_price: 11.00,
    is_featured: true,
    print_types_available: ['screen_print', 'dye_sublimation'],
  },
  {
    sku: 'TEE-NL-6210',
    title: 'Next Level 6210 Tri-Blend Tee',
    category: 'T-Shirts',
    turnaround_days: 12,
    starting_price: 22.00,
    is_featured: false,
    print_types_available: ['screen_print'],
  },
  {
    sku: 'HOOD-GILDAN-18500',
    title: 'Gildan Heavy Blend Hoodie',
    category: 'Sweatshirts',
    turnaround_days: 12,
    starting_price: 24.00,
    is_featured: true,
    print_types_available: ['screen_print', 'embroidery'],
  },
  {
    sku: 'CREW-COMFORT-1566',
    title: 'Comfort Colors Crewneck',
    category: 'Sweatshirts',
    turnaround_days: 12,
    starting_price: 26.00,
    is_featured: true,
    print_types_available: ['screen_print', 'puff_print'],
  },
  {
    sku: 'HAT-YUPOONG-6606',
    title: 'Yupoong Snapback',
    category: 'Headwear',
    turnaround_days: 14,
    starting_price: 16.00,
    is_featured: false,
    print_types_available: ['embroidery'],
  },
  {
    sku: 'HAT-RICH-112',
    title: 'Richardson 112 Trucker Hat',
    category: 'Headwear',
    turnaround_days: 14,
    starting_price: 18.00,
    is_featured: true,
    print_types_available: ['embroidery', 'screen_print'],
  },
  {
    sku: 'POLO-PORT-K500',
    title: 'Port Authority Polo',
    category: 'Polos',
    turnaround_days: 10,
    starting_price: 28.00,
    is_featured: false,
    print_types_available: ['embroidery', 'screen_print'],
  },
  {
    sku: 'POLO-NIKE-DRIF',
    title: 'Nike Dri-FIT Polo',
    category: 'Polos',
    turnaround_days: 12,
    starting_price: 45.00,
    is_featured: true,
    print_types_available: ['embroidery'],
  },
  {
    sku: 'OUT-PORT-J317',
    title: 'Port Authority Soft Shell Jacket',
    category: 'Outerwear',
    turnaround_days: 15,
    starting_price: 55.00,
    is_featured: false,
    print_types_available: ['embroidery', 'screen_print'],
  },
]

async function fetchShopifyProducts() {
  await new Promise(resolve => setTimeout(resolve, 300))
  return MOCK_SHOPIFY_PRODUCTS
}

function mapToSupabase(p) {
  return {
    sku: p.sku,
    name: p.title,
    category: p.category,
    turnaround_days: p.turnaround_days,
    starting_price: p.starting_price,
    is_featured: p.is_featured,
    print_types_available: p.print_types_available,
  }
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const shopifyProducts = await fetchShopifyProducts()
    const mapped = shopifyProducts.map(mapToSupabase)

    const { data, error } = await supabase
      .from('products')
      .upsert(mapped, { onConflict: 'sku' })
      .select()

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: `Synced ${mapped.length} products from Shopify to Supabase`,
      synced_at: new Date().toISOString(),
      products_synced: mapped.length,
      source: 'mock_shopify',
      data,
    })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const body = await request.json().catch(() => ({}))
    const { category } = body

    let shopifyProducts = await fetchShopifyProducts()

    if (category) {
      shopifyProducts = shopifyProducts.filter(
        p => p.category.toLowerCase() === category.toLowerCase()
      )
    }

    const mapped = shopifyProducts.map(mapToSupabase)

    const { data, error } = await supabase
      .from('products')
      .upsert(mapped, { onConflict: 'sku' })
      .select()

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: `Synced ${mapped.length} products${category ? ` in category: ${category}` : ''}`,
      synced_at: new Date().toISOString(),
      products_synced: mapped.length,
      source: 'mock_shopify',
      data,
    })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
