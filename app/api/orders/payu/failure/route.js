const API_BASE = process.env.API_URL

export async function POST(request) {
  if (!API_BASE) {
    console.error('API_URL is not configured')
    return Response.redirect(new URL('/payment/failure?reason=configuration', request.url), 303)
  }

  try {
    const formData = await request.clone().formData()
    const data = Object.fromEntries(formData.entries())
    const rawPayUForm = await request.text()
    const orderId = data.udf1 || data.orderId || `ORD-${Date.now()}`

    try {
      const response = await fetch(`${API_BASE}/orders/payu/failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: rawPayUForm,
      })

      if (!response.ok) {
        console.error('PayU failure callback failed:', await response.text())
        return Response.redirect(new URL('/payment/failure?reason=callback', request.url), 303)
      }
    } catch (backendError) {
      console.error('Unable to forward PayU failure callback:', backendError)
      return Response.redirect(new URL('/payment/failure?reason=callback', request.url), 303)
    }

    // ✅ YAHAN CHANGE KARO - Dynamic URL
    // Pehle: /payment/failure?orderId=xxx
    // Ab: /payment/failure/xxx
    const redirectUrl = new URL(`/payment/failure/${orderId}`, request.url)
    return Response.redirect(redirectUrl, 303)

  } catch (error) {
    console.error('PayU failure callback error:', error)
    return Response.redirect(new URL('/payment/failure', request.url), 303)
  }
}