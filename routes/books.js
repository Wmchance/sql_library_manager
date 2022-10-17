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
  let searchVal = req.query.search || ""; //Pulls the value of the query key 'search', which was set in the searchInput input from the index view

  const pageNum = req.query.page; //Pulls the value of the query key 'page', which was set in the pageBtn input from the index view
  const offsetNum = (pageNum-1)*5; //Sets the offset value to use when pulling rows from the database

  if(!pageNum) { //Allows for rendering of route when first loading and a page num has yet to be added
    const books = await Book.findAndCountAll({ 
      offset: 0, 
      limit: 5,
      where: { //Provides the db with the a value to use to match & pull in rows with
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
    res.render('index', { books, searchVal }); //Passing the searchVal through the render route lets it be stored in index.pug. With the value stored, pagination and be added to searched results.
  } else { //Allows for rendering of route after a page num has been added
    const books = await Book.findAndCountAll({ 
      offset: offsetNum, 
      limit: 5, 
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
    res.render('index', { books, searchVal }); //Passing the searchVal through the render route lets it be stored in index.pug. With the value stored, pagination and be added to searched results.
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
    if(error.name === "SequelizeValidationError") { //Displays error msg to user if they haven't added a title or author
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
    if(error.name === "SequelizeValidationError") { //Displays error msg to user if they haven't added a title or author
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
    await book.destroy(); //Deletes book from db
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;