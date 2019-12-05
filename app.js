var express = require("express"),
  app = express(),
  User = require("./models/user"),
  passport = require("passport"),
  localstrategy = require("passport-local"),
  passport = require("passport"),
  mongoose = require("mongoose"),
  passportlocalmongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  bodyParser = require("body-parser"),
  Comment = require("./models/comments"),
  methodOverride = require("method-override"),
  Blogtech = require("./models/Blogtech");
mongoose.connect("mongodb://localhost:27017/blogtech", {
  useNewUrlParser: true
});
// mongoose.connect("mongodb+srv://techsmartjsk:DUj7vE_R_EH_Rvy@futuristic-xyk51.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true});

var $ = require("jquery");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "Jaskirat",
    resave: false,
    saveUninitialized: false
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//========================
//ROUTES
//========================

//========================
//Blogtech ROUTES
//========================
app.get("/",function(req,res){
   res.render("app");
});




app.get("/Myspace",IsloggedIn, function(req, res) {
  Blogtech.find({}, function(err, Blogtech) {
    if (err) {
      console.log("error!!!");
    } else {
      res.render("Blogtech", { Blogtech: Blogtech });
    }
  });
});

app.post("/Myspace", IsloggedIn, function(req, res) {
  var title = req.body.Blog.title;
  var content = req.body.Blog.content;
  var image = req.body.Blog.image;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  Blogtech.create(
    { title: title, content: content, image: image, author: author },
    function(err, newb) {
      if (err) {
        console.log(err);
      } else {
        console.log(newb);
        req.flash("success", "Added New Blog!");
        res.redirect("/Myspace");
      }
    }
  );
});
app.get("/new", IsloggedIn, function(req, res) {
  res.render("New Blog");
});
app.get("/signup", function(req, res) {
  res.render("signup");
});
app.post("/signup", function(req, res) {
  req.body.username;
  req.body.password;
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    function(err, log) {
      if (err) {
        console.log(err);
        req.flash("error", "User with same username Already Exists!");
        return res.redirect("/");
      }
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome!  " + req.user.username);
        res.redirect("/");
      });
    }
  );
});
app.get("/login", function(req, res) {
  res.render("login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/Myspace",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);
app.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged You Out!!");
  res.redirect("/");
});

app.get("/:id", function(req, res) {
  Blogtech.findById(req.params.id)
    .populate("comments")
    .exec(function(err, found) {
      if (err) {
        console.log(err);
      } else {
        console.log(found);
        res.render("show", { Blog: found });
      }
    });
});

app.delete("/:id", function(req, res) {
  Blogtech.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/Myspace");
    }
  });
});

app.get("/:id/edit", OwnerShip, function(req, res) {
  Blogtech.findById(req.params.id, function(err, fond) {
    if (err) {
      console.log("error!!");
    } else {
      res.render("edit", { Blog: fond });
    }
  });
});
app.put("/:id", function(req, res, next) {
  console.log("Blog Is Here !!! ");
  console.log(req.body.Blog);
  Blogtech.findByIdAndUpdate(req.params.id, req.body.Blog, function(editb) {
    req.flash("success", "Edited");
    res.redirect("/Myspace");
    return next;
  });
});

//========================
//COMMENTS ROUTES
//========================

app.get("/:id/comments", IsloggedIn, function(req, res) {
  Blogtech.findById(req.params.id, function(err, foundb) {
    if (err) {
      console.log(err);
    } else {
      res.render("newcomment", { Blog: foundb });
    }
  });
});
app.post("/:id", function(req, res) {
  Blogtech.findById(req.params.id, function(err, Blogtech) {
    if (err) {
      console.log(err);
    } else {
      Comment.create(req.body.comments, function(err, comments) {
        if (err) {
          console.log(err);
        } else {
          comments.author.id = req.user.id;
          comments.author.username = req.user.username;
          comments.save();
          Blogtech.comments.push(comments);
          Blogtech.save();
          console.log(comments);
          res.redirect("/");
        }
      });
    }
  });
});
app.get("/:id/comments/edit",OwnerShipComment, function(req, res) {
  Comment.findById(req.params.id, function(err, edit) {
    if (err) {
      console.log(err);
    } else {
      res.render("editcomment", { edit: edit });
    }
  });
});
app.put("/:id/comments", function(req, res) {
  Comment.findByIdAndUpdate(req.params.id, req.body.comments, function(
    err,
    edit
  ) {
    if (err) {
      console.log("Error!!!!");
      res.redirect("/login");
      console.log(err);
    } else {
      req.flash("success", "Comment Edited");
      res.redirect("/Myspace");
    }
  });
});
app.delete("/:id/comments", OwnerShipComment, function(req, res) {
  Comment.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/Myspace");
  });
});
function IsloggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please, Login In First");
  res.redirect("/login");
}
function OwnerShip(req, res, next) {
  Blogtech.findById(req.params.id, function(err, foundBlogtech) {
    if (err) {
      req.flash("error", "Blogtech Does not exists");
    } else {
     
      if (foundBlogtech.author.id.equals(req.user.id)) {
        return next();
      } else req.flash("error", "You Don't have permission To Do That !!!");
      res.redirect("/Myspace");
    }
  });
}

function OwnerShipComment(req, res, next) {
  Comment.findById(req.params.id, function(err, foundComment) {
    if (err) {
      req.flash("error", "Blogtech Does not exists");
    } else {
     
      if (foundComment.author.id.equals(req.user.id)) {
        return next();
      } else req.flash("error", "You Don't have permission To Do That !!!");
      res.redirect("/Myspace");
    }
  });
}
app.listen(3000);
console.log("hello");
