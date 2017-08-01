import axios from 'axios'
function apiRequest(method, path) {
  return async (data) => {
    const replacedPath = Object.keys(data).reduce( (path, key) => {
      return path.replace(`:${key}`, data[key])
    }, path)
    const response = await axios({
      method,
      url: `http://localhost:3000/api${replacedPath}`,
      data
    })
    return response.data
  }
}
export default {
  device: {
    validate: apiRequest('POST', '/devices/validate'),
    create: apiRequest('POST', '/devices'),
    verify: apiRequest('POST', '/devices/verify')
  },
  report: {
    create: apiRequest('POST', '/reports'),
    messages: {
      create: apiRequest('POST', '/reports/:reportId/messages')
    }
  }
}
