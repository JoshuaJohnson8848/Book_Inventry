const express = require('express');
const router = express.Router();

let books = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", price: 12.99 },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", genre: "Programming", price: 30.00 },
];

// Get all books (optionally filtered)
router.get('/', (req, res) => {
  let result = books;
  const { title, author, genre, sortBy } = req.query;

  if (title) result = result.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
  if (author) result = result.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
  if (genre) result = result.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
  if (sortBy === 'price') result.sort((a, b) => a.price - b.price);
  if (sortBy === 'title') result.sort((a, b) => a.title.localeCompare(b.title));

  res.json(result);
});

// Get book by ID
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

// Add a new book
router.post('/', (req, res) => {
  const { title, author, genre, price } = req.body;
  const newBook = {
    id: books.length + 1,
    title,
    author,
    genre,
    price
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

// Update a book
router.put('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: "Book not found" });

  const { title, author, genre, price } = req.body;
  if (title) book.title = title;
  if (author) book.author = author;
  if (genre) book.genre = genre;
  if (price) book.price = price;

  res.json(book);
});

// Delete a book
router.delete('/:id', (req, res) => {
  books = books.filter(b => b.id !== parseInt(req.params.id));
  res.json({ message: "Book deleted" });
});

module.exports = router;
