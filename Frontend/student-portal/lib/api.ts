export function apiUrl() {
  return process.env.NEXT_PUBLIC_STUDENT_PORTAL_API_URL || "http://localhost:5156/api"
}

export function authHeaders(): HeadersInit {
  const accessToken = sessionStorage.getItem("portal.accessToken")
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}
