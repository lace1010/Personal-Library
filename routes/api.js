"use strict";

const mongoose = require("mongoose"); // Need to require mongoose
mongoose.set("useFindAndModify", false); // Gets rid of deprication error on console.log when using findByIdandUpdate()

module.exports = function (app) {
  let uri = process.env.PERSONAL_LIBRARY_MONGO_URI;
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const Schema = mongoose.Schema;

  // Use the next four lines to see if you are conneted to mongoose correctly
  let db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Connection Successful!");
  });

  // Create a model structure
  const bookSchema = new Schema({
    title: { type: String, required: true },
    commentcount: { type: Number, required: true },
    comments: { type: [String], required: true },
  });
  const Book = mongoose.model("Book", bookSchema);

  app
    .route("/api/books")
    .get((req, res) => {
      // Display all books in database in an array
      Book.find({}, (error, foundBooks) => {
        if (error) return console.log(error);
        res.json(foundBooks);
      }) // *** Add this to deselct __v so it doesn't show in response. '-' hides it
        .select("-__v");

      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post((req, res) => {
      let title = req.body.title;

      // Create new book model to be stored in database
      let newBook = new Book({
        title: title,
        commentcount: 0,
        comments: [],
      });

      // Save the newBook to database
      newBook.save((error, savedBook) => {
        if (error) return res.json("missing required field title");
        if (!error && savedBook) {
          // Do this instead of res.json(savedBook) because we don't want to show comment, commentcount or __v
          return res.json({ _id: savedBook._id, title: savedBook.title });
        }
      });
    })

    .delete(async (req, res) => {
      await Book.deleteMany({}, (error, success) => {
        if (error) return console.log(error);
        if (!error && success) {
          return res.json("complete delete successful");
        }
      });
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get((req, res) => {
      let bookId = req.params.id;
      Book.findById(bookId, (error, foundBook) => {
        if (error) return res.json("no book exists");
        if (!error && foundBook) {
          res.json(foundBook);
        }
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post((req, res) => {
      let bookId = req.params.id;
      let comment = req.body.comment;

      Book.findByIdAndUpdate(
        bookId,
        { $push: { comments: [comment] }, $inc: { commentcount: 1 } },
        (error, updatedBook) => {
          if (error) return res.json("missing required field comment");
          if (!error && updatedBook) {
            res.json(updatedBook);
          }
        }
      );
      //json res format same as .get
    })

    .delete((req, res) => {
      let bookId = req.params.id;
      Book.findByIdAndDelete(bookId, (error, deletedBook) => {
        if (error) return res.json("no book exists");
        if (!error & deletedBook) return res.json("delete successful");
      });
      //if successful response will be 'delete successful'
    });
};
