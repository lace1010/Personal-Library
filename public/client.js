$(document).ready(function () {
  let items = [];
  let itemsRaw = [];

  $.getJSON("/api/books", function (data) {
    itemsRaw = data;
    $.each(data, function (i, val) {
      items.push(
        '<li class="bookItem" id="' +
          i +
          '">' +
          val.title +
          " - " +
          val.commentcount +
          " comments</li>"
      );
      return i !== 14;
    });
    if (items.length >= 15) {
      items.push("<p>...and " + (data.length - 15) + " more!</p>");
    }
    $("<ul/>", {
      class: "listWrapper",
      html: items.join(""),
    }).appendTo("#display");
  });

  let comments = [];
  $("#display").on("click", "li.bookItem", function () {
    $("#detailTitle").html(
      "<h2 id='bookTitle'>" +
        itemsRaw[this.id].title +
        "</h2> <p id='idUnderTitle'>(id: " +
        itemsRaw[this.id]._id +
        ")</p>"
    );
    $.getJSON("/api/books/" + itemsRaw[this.id]._id, function (data) {
      comments = [];
      $.each(data.comments, function (i, val) {
        comments.push("<li class='commentLi'>" + val + "</li>");
      });
      comments.push(
        '<br><form id="newCommentForm"><input type="text" id="commentToAdd" name="comment" placeholder="New Comment"></form>'
      );
      comments.push(
        '<br><button class="addComment" id="' +
          data._id +
          '">Add Comment</button>'
      );
      comments.push(
        '<button class="deleteBook" id="' + data._id + '">Delete Book</button>'
      );
      $("#detailComments").html(comments.join(""));
    });
  });

  $("#bookDetail").on("click", "button.deleteBook", function () {
    $.ajax({
      url: "/api/books/" + this.id,
      type: "delete",
      success: function (data) {
        //update list
        $("#detailComments").html(
          '<p style="color: red;">' +
            data +
            "<p><p style='margin-top:2rem;'>Refresh the page</p>"
        );
      },
    });
  });

  $("#bookDetail").on("click", "button.addComment", function () {
    let newComment = $("#commentToAdd").val();
    $.ajax({
      url: "/api/books/" + this.id,
      type: "post",
      dataType: "json",
      data: $("#newCommentForm").serialize(),
      success: function (data) {
        comments.unshift(newComment); //adds new comment to top of list
        $("#detailComments").html(comments.join(""));
      },
    });
  });

  $("#newBook").click(function () {
    $.ajax({
      url: "/api/books",
      type: "post",
      dataType: "json",
      data: $("#newBookForm").serialize(),
      success: function (data) {
        //update list
      },
    });
  });

  $("#deleteAllBooks").click(function () {
    $.ajax({
      url: "/api/books",
      type: "delete",
      dataType: "json",
      data: $("#newBookForm").serialize(),
      success: function (data) {
        // update list
        // Reload screen after update
        alert("Successfully deleted all books");
        {
          window.location.reload(true);
        }
      },
    });
  });
});
