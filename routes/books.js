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
router.post('/new', asyncHandler(async (req, res) => {
  let newBook;
  try {
    newBook = await Book.create(req.body);
    res.redirect("/books/" + newBook.id);
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      res.render('new-book', { error })
    } else {
      throw error;
    }  
  }
}));

/* (Read/GET) Shows book detail form */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id); //get the book, and store in a variable
  if(book) {
    res.render('update-book', { book });
  } else {
    // catch 404 and forward to error handler
    const err = new Error(); 
        err.status = 404; 
        err.message = 'Sorry, but it looks like a book with that id is not in our database.';
        throw err;
  }
}));

/* (Update/POST) Update existing book entry. */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try{
    book = await Book.findByPk(req.params.id); //get find the book, and store in a variable
    await book.update(req.body);
    res.render('update-book', { book });
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      console.log(error);
      res.render('update-book', { book, error })
    } else {
      throw error;
    }
  }
}));

/* (Delete/POST) Delete book entry. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;