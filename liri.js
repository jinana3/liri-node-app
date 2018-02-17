//code to read and set any environment variables with the dotenv package
require('dotenv').config();
//other package requirements
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require("fs");
//require import of keys.js
var keys = require("./keys.js");


//use the packages
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

//user enter commands//////////////////////////////////////////
var input = process.argv;

//function to parse command
var searchTerm = function(){
	if (input[3] === undefined){
		return undefined;
	}
	else{
		var Arr = [];
		for(var i=3; i<input.length;i++){
			Arr.push(input[i]);
		}
		var output = Arr.toString().replace(/,/g , " ");
		return output;
	}
	
}
//function to write to log
var write =  function(content){
	fs.appendFile("log.txt", content, function(err){
		if(err){
			console.log(err);
		}
	})
}


//functions to get info from APIs///////////////////////////////
var getTweets = function(){
	//my-tweets
	var user = "JinaYiming";

	//get info from Twitter
	console.log(user); //default
	var params = {count: 20, screen_name: user};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  if (!error) {
	  	for (var i=0; i<tweets.length; i++){
	  		var log = tweets[i].text + "\n" +
	  					tweets[i].created_at + "\n";
	  		console.log("--------------------");
	  		console.log(log);
	  		write(log);

	  	}
	  }
	  else{
	  	console.log(error);
	  	write(log);
	  }
	});
}

var getSpotify = function(song){
	//spotify-this-song

	//get info from Spotify
	if(song === undefined){
		console.log("The Sign");
		var params = {type: "track", query: "The Sign"};
		spotify.search(params, function(err, data){
			if(!err){
		    	data.tracks.items.forEach(function(ea){
		    		if (ea.artists[0].name === 'Ace of Base' && ea.name === 'The Sign'){
		    			var log = "artist: " + ea.artists[0].name + "\n" +
	                    		"name: " + ea.name + "\n" +
	                            "link: " + ea.external_urls.spotify + "\n" +
	                            "album: " + ea.album.name + "\n";
		    			console.log("--------------------");
	                	console.log(log);
	                	write(log);
		    		} // how can i check and then break once the desired result is found?

	            });
			}
			else{
				console.log(err);
				write(log);
			}
		})
	
	}

	else{
		console.log(song);
		var params = {type: "track", query: song, limit: 20};
		spotify.search(params, function(err, data) {
		  	if (!err) {
		    	data.tracks.items.forEach(function(ea){
		    		var log = "artist: " + ea.artists[0].name + "\n" +
	                    		"name: " + ea.name + "\n" +
	                            "link: " + ea.external_urls.spotify + "\n" +
	                            "album: " + ea.album.name + "\n";
	                console.log("--------------------");
	                console.log(log);
	                write(log);
	            });
		  	}
		  	else{
		  		console.log(err);
		  		write(log);
		  	}
		});
	}
}

var getMovie = function(mov){
		//movie-this
		var APIkey = "trilogy";
		var queryURL = "http://www.omdbapi.com/?t=" +
						mov +
						"&y=&plot=short&apikey=" +
						APIkey;

		//get info from request to IMDB
		request(queryURL, function(error, response, body){
			if(!error && response.statusCode === 200){
				var output = JSON.parse(body);
				var rtRating;
				for(var i = 0; i<output.Ratings.length; i++){
					if (output.Ratings[i].Source === "Rotten Tomatoes"){
						rtRating = output.Ratings[i].Value;
					}
					else{
						rtRating = "unknown";
					}
				}
				var log = "title: " + output.Title + "\n" +
							"release year: " + output.Year+ "\n"+
							"IMDB rating: "+ output.imdbRating+ "\n"+
							"Rotten Tomatoes rating: "+ rtRating+ "\n"+
							"country: "+ output.Country+ "\n"+
							"language: "+ output.Language+ "\n"+
							"plot: "+ output.Plot+ "\n"+
							"actors: "+ output.Actors + "\n";
				console.log("--------------------");
				console.log(log);
				write(log);

			}
			else{
				console.log(error);
				write(log);
			}
		})
}



//dealing with node commands////////////////////////////////////
if (input[2] === 'my-tweets'){
	write('---------------\n');
	write(input[2] + "\n");
	getTweets();
}

else if (input[2] === 'spotify-this-song'){
	var song = searchTerm();
	write('---------------\n');
	write(input[2] + "\n");
	getSpotify(song);
}

else if (input[2] === 'movie-this'){
	
	var movie = searchTerm();
	write('---------------\n');
	write(input[2] + "\n");
	if (movie === undefined){
		getMovie("Mr. Nobody");
	}
	else{
		getMovie(movie);
	}
}

else if (input[2] === 'do-what-it-says'){
	write('---------------\n');
	write(input[2] + "\n");
	fs.readFile("random.txt", "utf8", function(error, data){
		if (!error){
			//store text results in array
			var dataArr = data.split(",");

			if (dataArr[0] === 'my-tweets'){
				write(dataArr[0] + "\n");
				getTweets();
			}

			else if (dataArr[0] === 'spotify-this-song'){
				var song = dataArr[1];
				write(dataArr[0] + "\n");
				getSpotify(song);
			}

			else if (dataArr[0] === 'movie-this'){
				
				var movie = dataArr[1];
				write(dataArr[0] + "\n");
				if (movie === undefined){
					getMovie("Mr. Nobody");
				}
				else{
					getMovie(movie);
				}
			}
		}
		else{
			console.log(error);
			write(error);
		}
	})
}


//end