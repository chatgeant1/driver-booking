import axios from 'axios'
const abc = await axios.get(`http://localhost:3000/drivers/nearby-driver-list?x=1&y=2`); 
const data = abc.data
console.log("fetching", data)