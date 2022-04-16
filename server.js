const url = require('url');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const needle = require('needle');
// const axios = require('axios');
const pino = require('express-pino-logger')();


if(process.env.NODE_ENV !== 'production') require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


const API_BASE_URL_SOIL = process.env.API_BASE_URL_SOIL
const API_KEY_NAME_WEATHER = process.env.API_KEY_NAME_WEATHER
const API_KEY_NAME_SOIL = process.env.API_KEY_NAME_SOIL
const API_KEY_VALUE_WEATHER = process.env.API_KEY_VALUE_WEATHER
const API_POLYGON_ID = process.env.API_POLYGON_ID
const API_KEY_VALUE_SOIL = process.env.API_KEY_VALUE_SOIL
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_API_NAME = process.env.POLYGON_API_NAME;
const POLYGON_BASE_URL = process.env.POLYGON_BASE_URL;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(pino);


app.get('/service-worker.js' ,(req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'service-worker.js'));
})


// Get request to get the soil data

app.get('/soil', async (req, res) =>{

  console.log(process.env)
  try{

    const soil_params = new URLSearchParams({

      [API_KEY_NAME_SOIL]: API_POLYGON_ID,
      ...url.parse(req.url,true).query
      
    });

    const soil_params_2 = new URLSearchParams({
      [API_KEY_NAME_WEATHER]: API_KEY_VALUE_SOIL,
      ...url.parse(req.url,true).query
    })

    const res_Soil = await needle('get', `${API_BASE_URL_SOIL}?${soil_params}&${soil_params_2}`)
    

    const data_soil = res_Soil.body

    if(process.env.NODE_ENV !== 'production'){
      console.log(`REQUEST: ${API_BASE_URL_SOIL}?${soil_params}&${soil_params_2}`)
    }
 
    res.status(200).json((data_soil))
  } catch(error){
     res.status(500).json({ error })
  }
   
})


// Get request to get the polygon 

app.get('/shape', async (req, res) =>{

  try{

    const polygon_params = new URLSearchParams({

      [POLYGON_API_NAME]: POLYGON_API_KEY,
      ...url.parse(req.url,true).query
      
    });

    const polygon_Shape = await needle('get', `${POLYGON_BASE_URL}?${polygon_params}`)
    

    const polygon_data = polygon_Shape.body

    if(process.env.NODE_ENV !== 'production'){
      console.log(`REQUEST: ${POLYGON_BASE_URL}?${polygon_params}`)
    }
 
    res.status(200).json((polygon_data))
  } catch(error){
     res.status(500).json({ error })
  }
   
})


app.get('/api/get-speech-token', async (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  const speechKey = process.env.SPEECH_KEY;
  const speechRegion = process.env.SPEECH_REGION;

  if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
      res.status(400).send('You forgot to add your speech key or region to the .env file.');
  } else {
      const headers = { 
          headers: {
              'Ocp-Apim-Subscription-Key': speechKey,
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      };

      try {
          const tokenResponse = await needle(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
          res.send({ token: tokenResponse.data, region: speechRegion });
      } catch (err) {
          res.status(401).send('There was an error authorizing your speech key.');
      }
  }
});


app.listen(port, ()=>{
    console.log(`app is running on Port ${port}`);
});


