let axios = require("axios");
let express = require("express");
let app = express();

// retrieve the api key and base api url from env.json
let apiFile = require("../env.json");
let apiKey = apiFile["api_key"];
let baseUrl = apiFile["base_api_url"];

//App will run on localhost port 3000
let port = 3000;
let hostname = "localhost";

//Indicate what folder the html static files will be located in
app.use(express.static("public_html"));


//Router handler for GET request to the /forecast url
app.get("/forecast", function (req, res) {

    //Extract zip code from the query string parameter
	let zip = req.query.zip;

    //Make a GET request to the OpenWeather API with the zip code retrieved from the client and the apiKey
    axios.get(`${baseUrl}?zip=${zip}&appid=${apiKey}`).then(function (response) {
		console.log(`Sent GET request to ${baseUrl} for zip ${zip}`);
		
        console.log("response status code: " + response.status);

        res.statusCode = 200;

        let listOfObjs = [];

        //Iterate through every object in the 'list' array in the response data
        //and make an array of objects that store the date, weather description, temperature and the img icon code
        for (var i = 0; i < response.data.list.length; i++) {
            let object = {};
            object['dt_txt'] = response.data.list[i].dt_txt;
            object['weather_description'] = response.data.list[i].weather[0].description;
            object['temperature_kelvin'] = response.data.list[i].main.temp;
            object['icon'] = response.data.list[i].weather[0].icon;
            listOfObjs.push(object); 
        }

        //Send a JSON response back to the client with the list of object that hold the needed data and
        //the city name of the zip code requested by the client
        res.json({'fiveDayForecast': listOfObjs, 'city': response.data.city.name});
            
    })

    //Catch any errors that arise from making a GET request to the OpenWeather API
    //Send a JSON response back to the client with the status code that was sent back by the API
    //and the message that was sent in the JSON object send back by the API
    .catch(function (error) {
        res.statusCode = error.response.data.cod;
        res.json({'error' : error.response.data.message})
    });
});

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
