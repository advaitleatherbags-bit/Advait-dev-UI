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
      const response = await fetch(`${API_BASE}/orders/payu/success`, {
        method: 'POST',
        // The ASP.NET endpoint uses [FromForm], so preserve PayU's form encoding.
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: rawPayUForm,
      })

      if (!response.ok) {
        const message = await response.text()
        console.error('PayU success callback failed:', message)
        return Response.redirect(new URL('/payment/failure?reason=callback', request.url), 303)
      }
    } catch (backendError) {
      console.error('Unable to forward PayU success callback:', backendError)
      return Response.redirect(new URL('/payment/failure?reason=callback', request.url), 303)
    }

    const redirectUrl = new URL('/payment/success', request.url)
    redirectUrl.searchParams.set('orderId', orderId)
    redirectUrl.searchParams.set('status', 'success')

    // A callback arrives as POST. 303 makes the browser load the result page with GET.
    return Response.redirect(redirectUrl, 303)
  } catch (error) {
    console.error('PayU success callback error:', error)
    return Response.redirect(new URL('/payment/success?status=unknown', request.url), 303)
  }
}
