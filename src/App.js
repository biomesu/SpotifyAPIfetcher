import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const CLIENT_ID = "a116060323d948f19384cfc61f8426af";
const CLIENT_SECRET = "45c19ce7c77c4a78a1ec741cf180162a";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState([]); // New state for favorite albums

  useEffect(() => {
    // API access token
    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token))
  }, [])

  // Search

async function search() {
  console.log("Search for " + searchInput);

  var searchParameters = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  }

  try {
    // Get artist ID
    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
      .then(response => response.json())
      .then(data => {
        // Check if data.artists and data.artists.items exist
        if (data.artists && data.artists.items && data.artists.items.length > 0) {
          return data.artists.items[0].id;
        } else {
          throw new Error("No artist found");
        }
      });

    console.log("Artist ID is " + artistID);

    // Get albums with Artist ID
    var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setAlbums(data.items || []); // Ensure data.items exists or default to an empty array
      });
  } catch (error) {
    console.error("Error during search:", error);
  }
}


  // Function to add album to favorites
  const addToFavorites = (album) => {
    setFavoriteAlbums((prevFavorites) => [...prevFavorites, album]);
  };
   const removeFromFavorites = (album) => {
    setFavoriteAlbums((prevFavorites) => prevFavorites.filter(favAlbum => favAlbum.id !== album.id));
  };

  console.log(albums);

  return (
    <div className="App">
      <Container>
        <h2>Favorited Albums</h2>
        <Row className="mx-2 row row-cols-4">
          {favoriteAlbums.map((album, i) => (
            <Card key={i}>
              <Card.Img src={album.images[0].url} />
              <Card.Body>
                <Card.Title>{album.name}</Card.Title>
                <Button onClick={() => removeFromFavorites(album)}>Remove</Button>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>

      <Container>
        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="Search for Artist"
            type="input"
            onKeyPress={event => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>
            Search
          </Button>
        </InputGroup>
      </Container>

      <Container>
        <Row className="mx-2 row row-cols-4">
          {albums.map((album, i) => (
            <Card key={i}>
              <Card.Img src={album.images[0].url} />
              <Card.Body>
                <Card.Title>{album.name}</Card.Title>
                <Button onClick={() => addToFavorites(album)}>Favorite</Button>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default App;
