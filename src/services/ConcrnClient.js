import axios from 'axios'
function apiRequest(method, path) {
  return async (params) => {
    const response = await axios({
      method,
      url: `http://localhost:3000/api${path}`,
      params
    })
    return response.data
  }
}
export default {
  device: {
    validate: apiRequest('POST', '/devices/validate'),
    create: apiRequest('POST', '/devices'),
    verify: apiRequest('POST', '/devices/verify')
  }
}
