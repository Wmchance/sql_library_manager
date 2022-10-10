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

/* GET home page. */
router.get('/', asyncHandler(async (req, res) => {
  //res.render('index', { title: 'Express' });
  const books = await Book.findAll(); //get all the books, and store them in a variable
  res.json(books); //display the books on a webpage
}));

module.exports = router;
