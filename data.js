/*
  Mock dataset to power the app without external API.
  Each movie has: id, title, year, rating, overview, genres[], poster (relative path).
  Posters are placeholders using Unsplash image links (not base64).
*/
export const MOVIES = [
  {
    id: 1, title: "Noite de Caça", year: 2024, rating: 8.1,
    overview: "Um thriller tenso sobre uma caçada urbana que vira jogo psicológico entre desconhecidos.",
    genres: ["Thriller", "Drama"], poster: "https://images.unsplash.com/photo-1517604931442-4c5f1d3f6a7f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1"
  },
  {
    id: 2, title: "Amor em Off", year: 2023, rating: 7.4,
    overview: "Comédia romântica sobre conexões digitais que resistem ao mundo real.",
    genres: ["Romance", "Comédia"], poster: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2"
  },
  {
    id: 3, title: "Fuga das Sombras", year: 2022, rating: 8.7,
    overview: "Ação frenética com sequências coreografadas e uma missão impossível para salvar milhares.",
    genres: ["Ação", "Aventura"], poster: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3"
  },
  {
    id: 4, title: "Horizonte Azul", year: 2021, rating: 7.9,
    overview: "Drama intimista sobre uma família que reconstrói suas vidas após uma grande perda.",
    genres: ["Drama"], poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=4"
  },
  {
    id: 5, title: "Cosmos Vazio", year: 2020, rating: 8.9,
    overview: "Sci-fi atmosférico sobre isolamento e descoberta em uma espaçonave perdida.",
    genres: ["Ficção Científica", "Suspense"], poster: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=5"
  },
  {
    id: 6, title: "Rota da Vitória", year: 2019, rating: 7.2,
    overview: "Documentário esportivo que acompanha um time improvável rumo ao título.",
    genres: ["Documentário"], poster: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=6"
  },
  {
    id: 7, title: "No Limite", year: 2022, rating: 6.8,
    overview: "Suspense psicológico com reviravoltas e um protagonista imprevisível.",
    genres: ["Suspense"], poster: "https://images.unsplash.com/photo-1508051123996-69f8caf4891b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=7"
  },
  {
    id: 8, title: "Brilho de Verão", year: 2020, rating: 7.0,
    overview: "Road movie leve e visual sobre amizade e saudade.",
    genres: ["Aventura", "Comédia"], poster: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=8"
  },
  {
    id: 9, title: "Arquitetura do Medo", year: 2024, rating: 8.4,
    overview: "Horror minimalista que usa espaço e som como personagens.",
    genres: ["Horror"], poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=9"
  },
  {
    id: 10, title: "Andarilho das Estrelas", year: 2021, rating: 9.0,
    overview: "Épico contemplativo sobre exploração e o preço da imortalidade.",
    genres: ["Ficção Científica", "Drama"], poster: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=10"
  }
];

export const GENRES = ["Ação","Aventura","Comédia","Drama","Ficção Científica","Horror","Romance","Thriller","Documentário","Suspense"];