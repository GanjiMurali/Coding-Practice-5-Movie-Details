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

//3) GET Movie Details With Movie Id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const dbResponse = await db.get(getMovieQuery);
  response.send(dbResponse);
});

//4) PUT Update Movie Details With Movie Id
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//5) DELETE Specific Movie Details
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//6) GET Directors Table
app.get("/directors/", async (request, response) => {
  const directorQuery = `SELECT * FROM director;`;
  const dbResponse = await db.all(directorQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };
  newDirectorArray = [];
  for (let director of dbResponse) {
    let directorArray = convertDbObjectToResponseObject(director);
    newDirectorArray.push(directorArray);
  }

  response.send(newDirectorArray);
});

//7) GET Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNameQuery = `SELECT movie_name FROM movie JOIN director ON movie.director_id = director.director_id WHERE movie.director_id = ${directorId};`;
  const dbResponse = await db.all(getMovieNameQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };

  newMovieNameArray = [];
  for (let movieName of dbResponse) {
    let movie = convertDbObjectToResponseObject(movieName);
    newMovieNameArray.push(movie);
  }
  response.send(newMovieNameArray);
});

module.exports = app;
