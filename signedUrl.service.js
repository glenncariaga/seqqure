import axios from "axios";

let baseUrl = process.env.REACT_APP_WEB_API_DOMAIN || '';
baseUrl += '/api/signedUrl';

export const uploadFile = (key, file) => {
  //send request to the server: required info:  name/type : expected:  signed URL
  return (
    axios
      .post(
        baseUrl,
        {
          filename: key,
          filetype: file.type
        },
        { withCredentials: true }
      )
      //if successful, on promise, you have the signed URL
      .then(function (result) {
        var signedUrl = result.data.item;
        var options = {
          headers: {
            "Content-Type": file.type,
            withCredentials: true
          }
        };

        //this call is to upload the file:  the signed URL creates a file on S3 that will need to be "updated"
        return axios.put(signedUrl, file, options);
      })
      .catch(function (err) {
        console.log(err);
      })
  );
};

export const uploadFileDoc = (key, file) => {
  //send request to the server: required info:  name/type : expected:  signed URL
  return (
    axios
      .post(
        baseUrl + '/docs',
        {
          filename: key,
          filetype: file.type
        },
        { withCredentials: true }
      )
      //if successful, on promise, you have the signed URL
      .then(function (result) {
        var signedUrl = result.data.item;
        var options = {
          headers: {
            "Content-Type": file.type,
            withCredentials: true
          }
        };

        //this call is to upload the file:  the signed URL creates a file on S3 that will need to be "updated"
        return axios.put(signedUrl, file, options);
      })
      .catch(function (err) {
        console.log(err);
      })
  );
};

export const downloadFile = key => {
  const url = `${baseUrl}/${key}`;
  const config = {
    method: "GET",
    withCredentials: true,
    responseType: "blob"
  };

  return axios(url, config);
};

export const downloadFileDoc = key => {
  const url = `${baseUrl}/docs/${key}`;
  const config = {
    method: "GET",
    withCredentials: true,
    responseType: "blob"
  };

  return axios(url, config);
};