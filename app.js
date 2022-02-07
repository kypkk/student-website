const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Student = require("./models/student");
const res = require("express/lib/response");
const methodOverride = require("method-override");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: "true" }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((e) => {
    console.log("Connection failed");
    console.log(e);
  });

app.get("/", (req, res) => {
  res.send("This is the homepage!");
});

app.get("/students", async (req, res) => {
  try {
    let data = await Student.find();
    res.render("students.ejs", { data });
  } catch (e) {
    console.log(e);
    res.send("Error!!");
  }
});

app.get("/students/insert", (req, res) => {
  res.render("studentinsert.ejs");
});

app.post("/students/insert", (req, res) => {
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student Accepted");
      res.render("accepted.ejs");
    })
    .catch((e) => {
      console.log("Student rejected");
      console.log(e);
      res.render("rejected");
    });
});

app.get("/students/edit/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("edit.ejs", { data });
    } else {
      res.send("Cannot find student!");
    }
  } catch (e) {
    console.log(e);
    res.send("Error!!");
  }
});

app.put("/students/edit/:id", async (req, res) => {
  let { id } = req.params;
  let { name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.redirect(`/students/${id}`);
  } catch {
    res.render("rejected.ejs");
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("studentfile", { data });
    } else {
      res.send("Cannot find this student. Please enter a valid id");
    }
  } catch (e) {
    console.log(e);
    res.send("Error!!");
  }
});

app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.findOneAndDelete({ id })
    .then((meg) => {
      console.log(meg);
      res.send("Successfully deleted!");
    })
    .catch((e) => {
      console.log(e);
      res.send("Delettion failed!");
    });
});

app.get("/*", () => {
  res.status(404);
  res.send("Not allowed");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
// Student.findOneAndDelete({ name: "Ryan" }).then((meg) => {
//   console.log(meg);
// });
