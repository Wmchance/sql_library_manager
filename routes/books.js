const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");

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

//findAndCountAll method returns an object with two properties: count - an integer - the total number records matching the query; rows - an array of objects - the obtained records : https://sequelize.org/docs/v6/core-concepts/model-querying-finders/#findandcountall

/* (Read/GET) View all books table. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAndCountAll(); 
  res.render('index', { books });
}));

/* (Read/POST) View books based on search value. */
router.post('/', asyncHandler(async (req, res) => {
  let searchVal = req.body.search;
  let books;
  if(searchVal === "") {
    books = await Book.findAndCountAll(); 
    res.render('index', { books });
  } else {
    books = await Book.findAndCountAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.substring]: `${searchVal}`
            }
          },
          {
            author: {
              [Op.substring]: `${searchVal}`
            }
          },
          {
            genre: {
              [Op.substring]: `${searchVal}`
            }
          },
          {
            year: {
              [Op.substring]: `${searchVal}`
            }
          },
        ]
      }
    });
    searchVal = "";
    res.render('index', { books });
  }
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