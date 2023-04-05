const router = require("express").Router();
const pool = require("../connection");

router.get("/:id", async (req, res) => {
  try {
    const restaurant = await pool.query(
      `SELECT * FROM restaurants
      LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) 
      AS average_rating FROM reviews GROUP BY reviews.restaurant_id) reviews 
      ON restaurants.restaurant_id = reviews.restaurant_id WHERE restaurants.restaurant_id
      = $1`,
      [req.params.id]
    );

    const reviews = await pool.query(
      `SELECT * FROM reviews WHERE restaurant_id = $1`,
      [req.params.id]
    );

    res.status(200).json({
      restaurant: restaurant.rows[0],
      reviews: reviews.rows,
    });
  } catch (error) {
    res.status(500).json(error);
  }
  pool.end;
});

router.post("/:id/reviews", async (req, res) => {
  const { id, review, rating } = req.body;

  try {
    const newReview = await pool.query(
      `INSERT INTO reviews (restaurant_id, review, rating) VALUES ($1, $2, $3)`,
      [id, review, rating]
    );
    res.status(201).json(newReview.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
  pool.end;
});

router.post("/", async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO restaurants (name) VALUES ($1) RETURNING *`,
      [name]
    );
    res.status(201).send(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Could not add restaurant!",
    });
  }
  pool.end;
});

router.get("/", async (req, res) => {
  try {
    const restaurants = await pool.query(
      `SELECT * FROM restaurants
    LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) 
    AS average_rating FROM reviews GROUP BY reviews.restaurant_id) reviews 
    ON restaurants.restaurant_id = reviews.restaurant_id`
    );
    res.status(200).json(restaurants.rows);
  } catch (error) {
    res.status(500).json(error);
  }
  pool.end;
});

router.put("/:id", async (req, res) => {
  const { name } = req.body;

  try {
    const updatedRestaurant = await pool.query(
      `UPDATE restaurants SET name = $1 WHERE id = $2 RETURNING *`,
      [name, req.params.id]
    );
    res.status(201).json(updatedRestaurant.rows[0]);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM restaurants WHERE restaurant_id = $1`, [
      req.params.id,
    ]);
    res.status(200).json({
      message: "Deleted restaurant successfully.",
    });
  } catch (error) {
    res.status(500).json(error);
  }
  pool.end;
});

module.exports = router;
