const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatINR(amount) {
  const numericAmount = Number(amount)
  return inrFormatter.format(Number.isFinite(numericAmount) ? numericAmount : 0)
}
