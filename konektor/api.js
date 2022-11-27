var axios = require('axios');
// get dotenv

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const HostAPI = process.env.host_api;
// console.log(HostAPI);
// var config = {
//     method: 'get',
//     url: HostAPI + '/api/kamar/list',
//     headers: {
//         'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiUk0zIiwicHJpdmlsZWdlIjoicGFzaWVuIiwiaWF0IjoxNjY5NDQ4MzI3fQ.Hyl3_3XJFgAfx-1QnISqRtw2VyULJuZNacUjOVbvS9Q'
//     }
// };

// axios(config)
//     .then(function (response) {
//         console.log(JSON.stringify(response.data));
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

const getkamar = function () {
    var config = {
        method: 'get',
        url: HostAPI + '/api/kamar/list',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiUk0zIiwicHJpdmlsZWdlIjoicGFzaWVuIiwiaWF0IjoxNjY5NDQ4MzI3fQ.Hyl3_3XJFgAfx-1QnISqRtw2VyULJuZNacUjOVbvS9Q'
        }
    };

    return axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data.data));
            return response.data.data;

        })
        .catch(function (error) {
            console.log(error);
            return;
        });
}
const getkelas = function () {
    var config = {
        method: 'get',
        url: HostAPI + '/api/kamar/list',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiUk0zIiwicHJpdmlsZWdlIjoicGFzaWVuIiwiaWF0IjoxNjY5NDQ4MzI3fQ.Hyl3_3XJFgAfx-1QnISqRtw2VyULJuZNacUjOVbvS9Q'
        }
    };

    return axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data.data));
            return response.data.data;

        })
        .catch(function (error) {
            console.log(error);
            return;
        });
}
// getkamar();

module.exports = {
    getkamar,
    getkelas
}
