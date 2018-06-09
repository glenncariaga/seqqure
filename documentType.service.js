import axios from "axios";

let baseUrl = process.env.REACT_APP_WEB_API_DOMAIN || "";
baseUrl += "/api/documentType";

//////////////////////////////
// POST FUNCTIONS
//////////////////////////////
export function create(data) {
  const url = baseUrl;

  const config = {
    method: "post",
    data: data,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

//////////////////////////////
// PUT FUNCTIONS
/////////////////////////////
export function put(data, id) {
  const url = baseUrl + "/" + id;

  const config = {
    method: "put",
    data: data,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

export const provision = (data, tenantId) => {
  const url = baseUrl + "/provision/" + tenantId;

  const config = {
    method: "PUT",
    data,
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

//////////////////////////////
// GET FUNCTIONS
//////////////////////////////
export function getAll() {
  const url = baseUrl;

  const config = {
    method: "get",
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

export const getAllMaster = () => {
  const url = baseUrl + "/master";

  const config = {
    method: "GET",
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

export function getById(id) {
  const url = baseUrl + id;

  const config = {
    method: "get",
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

//////////////////////////////
// DELETE FUNCTIONS
//////////////////////////////
export function docuDel(id) {
  const url = baseUrl + "/" + id;

  const config = {
    method: "delete",
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
}

//////////////////////////////
// CALLBACK FUNCTIONS
//////////////////////////////
const responseSuccessHandler = response => {
  return response.data;
};

const responseErrorHandler = error => {
  return Promise.reject(error);
};
