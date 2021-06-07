const express = require("express");
const mysql = require("mysql2/promise");
const { mysqlConfig } = require("../config");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`SELECT * FROM recipes LIMIT 30`);
    con.end();
    res.send(data);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "Issue with connection. Please try again" });
  }
});

router.post("/", async (req, res) => {
  if (!req.body.image || !req.body.title || !req.body.description) {
    return res.status(400).send({ err: "Incorrect data" });
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `INSERT INTO recipes (image, title, description, owner_id) VALUES (${mysql.escape(
        req.body.image
      )}, ${mysql.escape(req.body.title)}, ${mysql.escape(
        req.body.description
      )}, ${mysql.escape(req.body.owner_id)})`
    );
    con.end();

    if (data.affectedRows !== 1) {
      console.log(data);
      res.status(500).send({ error: "Issue with order. Please try again" });
    }

    return res.send({ msg: "Successfully added" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "Issue with connection. Please try again" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [recipes] = await con.execute(
      `SELECT * FROM recipes WHERE id = ${mysql.escape(req.params.id)}`
    );

    const [comments] = await con.execute(
      `SELECT * FROM comments WHERE recipe_id = ${mysql.escape(req.params.id)}`
    );

    res.send({ data: { recipes, comments } });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: "Unexpected error" });
  }
});

module.exports = router;
