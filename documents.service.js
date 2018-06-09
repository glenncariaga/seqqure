import axios from "axios";

let baseUrl = process.env.REACT_APP_WEB_API_DOMAIN || "";
baseUrl += "/api/document/";

export function getByMilestoneId(milestoneId) {
  const url = baseUrl + "search/" + milestoneId;

  const config = {
    method: "get",
    url: url,
    data: milestoneId,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

export function create(data) {
  const url = baseUrl;

  const config = {
    method: "post",
    url: url,
    data: data,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

export function put(data, id) {
  const url = baseUrl + id;

  const config = {
    method: "put",
    url: url,
    data: data,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

export function getAll() {
  const url = baseUrl;

  const config = {
    method: "get",
    url: url,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

export function getById(id) {
  const url = baseUrl + id;

  const config = {
    method: "get",
    url: url,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

export function docuDel(id) {
  const url = baseUrl + id;

  const config = {
    method: "delete",
    url: url,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

export function getByEscrowId(id) {
  const url = baseUrl + "escrowID/" + id;

  const config = {
    method: "get",
    url: url,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

const responseSuccessHandler = response => {
  return response.data;
};

const responseErrorHandler = error => {
  return Promise.reject(error);
};
