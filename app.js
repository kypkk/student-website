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
    res.send(data);
  } catch (e) {
    console.log(e);
    res.send({ message: "Error!!" });
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
      res.send("New student has post successfully!");
    })
    .catch((e) => {
      res.status(404);
      console.log("Student rejected");
      res.send(e);
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
  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.send("successfully update the data");
  } catch {
    res.render("fail with update");
  }
});

class newdata {
  constructor() {}
  setProperty(key, value) {
    if (key !== "merit" && key !== "other") {
      this[key] = value;
    } else {
      this[`scholarship.${key}`] = value;
    }
  }
}

app.patch("/students/edit/:id", async (req, res) => {
  let { id } = req.params;
  let newObject = new newdata();
  for (let property in req.body) {
    newObject.setProperty(property, req.body[property]);
  }

  try {
    let d = await Student.findOneAndUpdate({ id }, newObject, {
      new: true,
      runValidators: true,
    });
    res.send("successfully update the data");
    console.log(d);
  } catch {
    res.render("fail with update");
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.send(data);
    } else {
      res.status(404);
      res.send({
        message: "Cannot find this student. Please enter a valid id",
      });
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

app.delete("/students/delete/", (req, res) => {
  let { id } = req.params;
  Student.deleteMany({})
    .then((meg) => {
      console.log(meg);
      res.send("Successfully deleted all of the datas!");
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
