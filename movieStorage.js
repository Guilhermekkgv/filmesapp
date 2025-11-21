// movieStorage.js
export class MovieStorage {
  constructor() {
    this.key = 'myMovies_v1';
  }

  save(movie) {
    const movies = this.getAll();
    const id = movie.id || `movie_${Date.now()}`;
    const index = movies.findIndex(m => m.id === id);

    const data = {
      id,
      title: movie.title,
      videoUrl: movie.video || movie.videoUrl || '',
      posterUrl: movie.poster || movie.posterUrl || '',
      description: movie.overview || movie.description || '',
      year: movie.year || '',
      genre: (movie.genres && movie.genres.join(',')) || movie.genre || '',
      duration: movie.duration || '',
      addedAt: movie.addedAt || Date.now()
    };

    if (index >= 0) movies[index] = data;
    else movies.push(data);

    localStorage.setItem(this.key, JSON.stringify(movies));
    return data;
  }

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch (e) {
      return [];
    }
  }

  getById(id) {
    return this.getAll().find(m => m.id === id);
  }

  delete(id) {
    const movies = this.getAll().filter(m => m.id !== id);
    localStorage.setItem(this.key, JSON.stringify(movies));
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}