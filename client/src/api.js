import axios from "axios";

const api = axios.create({
  baseURL: "https://microx-mern.onrender.com"
});

export default api;