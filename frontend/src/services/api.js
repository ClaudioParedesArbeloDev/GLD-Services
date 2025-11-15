import axios from "axios";
import CurrentURL from "../api/url";

const api = axios.create({
  baseURL: `${CurrentURL}/api`, 
});

export default api;
