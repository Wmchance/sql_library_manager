const express = require('express');
const router = express.Router();

const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* (Read) GET all books table. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll(); //get all the books, and store them in a variable
  res.render('books', { books });
  //res.json(books); //display the books on a webpage
}));

/* (Create) Create new book form */
router.get('/new', asyncHandler(async (req, res) => {
  res.render('new-book');
}));

/* (Read) Shows book detail form */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id); //get all the books, and store them in a variable
  res.render('update-book', { book });
}));

module.exports = router;