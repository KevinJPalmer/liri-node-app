
require('dotenv').config()
var axios = require('axios')
var moment = require('moment')
var Spotify = require('node-spotify-api')
// import the keys.js file and store it in a variable
var keys = require('./keys.js')
var fs = require('fs')
// // access keys information
var spotify = new Spotify(keys.spotifyKeys)


// variables to use
var commandStr = process.argv[2]
var argumentsStr = process.argv.slice(3).join(' ')
var logArray = []
var goGetAxiosURL = ''

//logic
function whatWeDoin() {
  //pushing command line arguments to an array, will push result to an array as well. then will put everything in log.txt file
  logArray.push(commandStr + '\n')
  logArray.push(argumentsStr + '\n')

  switch(commandStr) {
    case 'concert-this':
      // had issue using argumentsStr variable directly
      var spacereplace = argumentsStr.replace(/ /g,'%20')
      goGetAxiosURL = 'https://rest.bandsintown.com/artists/' + spacereplace + '/events?app_id=codingbootcamp'
      concertGet()
      break;


    case 'spotify-this-song':
      if (!argumentsStr) {
        argumentsStr = "the sign ace of base"
      }
      spotifyGet()
      break;


    case 'movie-this':
      if (!argumentsStr) {
        argumentsStr = 'Mr. Nobody'
      }
      goGetAxiosURL = 'http://www.omdbapi.com/?t=' + argumentsStr + '&y=&plot=short&apikey=trilogy'
      movieGet()
      break;


    case 'do-what-it-says':
      randomGet()
      break;


    default:
      logArray.push('VALID COMMANDS:\nconcert-this <band or artist name>\nspotify-this-song <song and artist>\nmovie-this <movie name>\ndo-what-it-says <uses input query from random.txt file>\n')
      writeToLog()
  }
}


//Bands in town request
function concertGet() {
  axios.get(goGetAxiosURL)
    .then(function(response) {
      var bandSrch = response.data
      if (bandSrch.length != 0) {
        for (i=0;i<bandSrch.length;i++) {
          logArray.push('==========================================================\n')
          logArray.push('Venue: ' + bandSrch[i].venue.name + '\n')
          logArray.push('City: ' + bandSrch[i].venue.city + '\n')
          if (bandSrch[i].venue.region) {logArray.push('State: ' + bandSrch[i].venue.region + '\n')}
          logArray.push('Country: ' + bandSrch[i].venue.country + '\n')
          var eventDate = moment(bandSrch[i].datetime).format('MM/DD/YYYY')
          logArray.push('Event Date: ' + eventDate + '\n')
        }
        logArray.push('==========================================================\n')
        writeToLog()
      }
      else {
        errorInfo()
      }
    })
    .catch(function(error) {
      errorInfo()
    })
  }
//Spotify request
function spotifyGet() {
  spotify.search ({
    type: 'track',
    query: argumentsStr,
    limit: 1
  })
  .then(function(response) {
    var srchArray = response.tracks.items
    for (i=0;i<srchArray.length;i++) {
      logArray.push('==========================================================\n')
      logArray.push('Artist(s): ' + srchArray[i].album.artists[0].name + '\n')
      logArray.push('Song Name: ' + srchArray[i].name + '\n')
      logArray.push('Spotify Preview Link: ' + srchArray[i].external_urls.spotify + '\n')
      logArray.push('Album: ' + srchArray[i].album.name + '\n')
    }
    logArray.push('==========================================================\n')
    writeToLog()
  })
  .catch(function(error) {
    errorInfo()
  })
}
//OMDB Request
function movieGet() {
  axios.get(goGetAxiosURL).then(
    function(response) {
      logArray.push('==========================================================\n')
      logArray.push('Title: ' + response.data.Title + '\n')
      logArray.push('Release Year: ' + response.data.Year + '\n')
      logArray.push('IMDB Rating: ' + response.data.imdbRating + '\n')
      logArray.push('Rotten Tomatoes Rating: ' + response.data.Ratings[1].Value + '\n')
      logArray.push('Country of origin: ' + response.data.Country + '\n')
      logArray.push('Language: ' + response.data.Language + '\n')
      logArray.push('Plot: ' + response.data.Plot + '\n')
      logArray.push('Starring: ' + response.data.Actors + '\n')
      logArray.push('=========================================================\n')
      writeToLog()
    })
    .catch(function(error) {
      errorInfo()
    })
  }
// Do what it says request
function randomGet() {
  fs.readFile('random.txt', 'utf8', function (error, data) {
    if (error) {
        errorInfo()
    }
    var searchArray = data.split(',')
    commandStr = searchArray[0]
    argumentsStr = searchArray[1]
    whatWeDoin()
})
}

//In case of error or unresolvable request
function errorInfo() {
  logArray.push('==========================================================\n')
  logArray.push('SORRY YOUR REQUEST COULD NOT BE COMPLETED\n')
  logArray.push('==========================================================\n')
  writeToLog()
}


//Write results to log.txt and show results on screen
function writeToLog() {
  for (i=0;i<logArray.length;i++) {
    var z = logArray[i]
    console.log(z)
    fs.appendFileSync('log.txt', z, function(err){
      if (err) {
        console.log(err)
      }
    })
  }
}

//Run command logic function
whatWeDoin()
