const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
let id = 0; // Need to set id for test book

suite("Functional Tests", function () {
  suite("Routing tests", () => {
    suite(
      "POST /api/books with title => create book object/expect book object",
      () => {
        test("Test POST /api/books with title", (done) => {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Book Title" })
            .end((err, res) => {
              id = res.body._id;
              assert.equal(res.status, 200);
              assert.equal(res.body.title, "Book Title");
              assert.isNotNull(res.body._id);
              done();
            });
        });

        test("Test POST /api/books with no title given", (done) => {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "" })
            .end((err, res) => {
              assert.equal(res.body, "missing required field title");
            });
          done();
        });
      }
    );

    suite("GET /api/books => array of books", () => {
      test("Test GET /api/books", (done) => {
        chai
          .request(server)
          .get("/api/books")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "_id");
            assert.property(res.body[0], "title");
            assert.property(res.body[0], "commentcount");
            assert.property(res.body[0], "comments");
          });
        done();
      });
    });

    suite("GET /api/books/[id] => book object with [id]", () => {
      test("Test GET /api/books/[id] with id not in db", (done) => {
        chai
          .request(server)
          .get("/api/books/" + "idnotindb")
          .end((err, res) => {
            assert.equal(res.body, "no book exists");
          });
        done();
      });

      test("Test GET /api/books/[id] with valid id in db", (done) => {
        chai
          .request(server)
          .get("/api/books/" + id)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, id);
            assert.equal(res.body.title, "Book Title");
          });
        done();
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      () => {
        test("Test POST /api/books/[id] with comment", (done) => {
          chai
            .request(server)
            .post("/api/books" + id)
            .send({ comment: "hello" })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isTrue(res.body.comments.includes(comment));
            });
          done();
        });

        test("Test POST /api/books/[id] without comment field", (done) => {
          chai
            .request(server)
            .post("/api/books/" + id)
            .send({ comments: "" })
            .end((err, res) => {
              assert.equal(res.body, "missing required field comment");
            });
          done();
        });

        test("Test POST /api/books/[id] with comment, id not in db", (done) => {
          chai
            .request(server)
            .post("/api/books/" + "idnotindb")
            .send({ comments: "Hello" })
            .end((err, res) => {
              assert.equal(res.body, "no book exists");
            });
          done();
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", () => {
      test("Test DELETE /api/books/[id] with valid id in db", (done) => {
        console.log(id, "<= id logged at 123");
        chai
          .request(server)
          .delete("/api/books/" + id)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, "delete successful");
            done();
          });
      });

      // test("Test DELETE /api/books/[id] with  id not in db", (done) => {
      //   chai
      //     .request(server)
      //     .delete("/api/books/" + "idnotindb")
      //     .send({ _id: "idnotindb" })
      //     .end((err, res) => {
      //       assert.equal(res.body, "no book exists");
      //       done();
      //     });
      // });
    });
  });
});
