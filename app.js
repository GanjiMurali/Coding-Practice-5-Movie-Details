const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//1) GET Movie Names
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT movie_name FROM movie;`;
  const movieArray = await db.all(getMovieQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  newMovieArray = [];
  for (let movie of movieArray) {
    let movieName = convertDbObjectToResponseObject(movie);
    newMovieArray.push(movieName);
  }

  response.send(newMovieArray);
});

//2) POST add New Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) VALUES ( ${directorId}, '${movieName}', '${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//3) GET MOvie Details With Movie Id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const dbResponse = await db.get(getMovieQuery);
  response.send(dbResponse);
});

module.exports = app;
