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

/* (Read/GET) View all books table. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll(); //get all the books, and store them in a variable
  res.render('books', { books });
  //res.json(books); //display the books on a webpage
}));

/* (Read/GET) Create new book form */
router.get('/new', asyncHandler(async (req, res) => {
  res.render('new-book');
}));

/* (Create/POST) Create new book entry. */
router.post('/', asyncHandler(async (req, res) => {
  let newBook;
  try {
    newBook = await Book.create(req.body);
    res.redirect("/books/" + newBook.id);
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      newBook = await Book.build(req.body);
      res.render("new-book", { newBook, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }  
  }
}));

/* (Read/GET) Shows book detail form */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id); //get all the books, and store them in a variable
  res.render('update-book', { book });
}));

module.exports = router;