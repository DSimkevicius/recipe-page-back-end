const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();
const { loggedIn } = require("./middleware");

const authRoutes = require("./routes/auth");
const recipesRoutes = require("./routes/recipes");
const { mysqlConfig } = require("./config");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send({ msg: "Server is running successfully" });
});

//comments

app.post("/comments", loggedIn, async (req, res) => {
  if (!req.body.comment || !req.body.recipe_id) {
    res.status(400).send({ error: "Bad data passed" });
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [data] = await con.execute(
      `INSERT INTO comments (user_id, recipe_id, comment) VALUES ('${
        req.user_id
      }', ${mysql.escape(req.body.recipe_id)}, ${mysql.escape(
        req.body.comment
      )})`
    );

    if (data.affectedRows !== 1) {
      console.log(data);
      res.status(500).send({ error: "Issue with order. Please try again" });
    }

    return res.send({ msg: "Successfully added comment" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "Issue with connection. Please try again" });
  }
});

app.use("/auth", authRoutes);
app.use("/recipes", recipesRoutes);

app.all("*", (req, res) => {
  res.status(404).send({ error: "Page not found" });
});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Listening on port ${port}`));
