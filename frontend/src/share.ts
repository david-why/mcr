const BASEURL = import.meta.env.VITE_SHARE_BACKEND

export async function listShares(limit: number = 20) {
  const response = await fetch(`${BASEURL}/shares?limit=${limit}`)
  return response.json()
}

export async function createShare(data: { name: string; params: string }) {
  const response = await fetch(`${BASEURL}/shares`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return response.json()
}
