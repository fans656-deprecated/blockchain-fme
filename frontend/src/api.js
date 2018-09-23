async function post(path, data) {
  return await fetch(path, {
    method: 'POST',
    credentials: 'include',
    body: data,
  });
}

async function put(path, data) {
  return await fetch(path, {
    method: 'PUT',
    credentials: 'include',
    body: data,
  });
}

const api = {
  post: post,
  put: put,
};

export default api;
