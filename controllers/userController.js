import sql from 'mssql';
import config from '../db/config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const pool = new sql.ConnectionPool(config.sql);

export const loginRequired = async (req, res, next) => {
  try {
    if (req.user) {
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized user!' });
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const register = async (req, res) => {
  let pool;
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    pool = await sql.connect(config.sql);

    const userResult = await pool
      .request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .query(
        'SELECT * FROM users WHERE username = @username OR email = @email'
      );

    const user = userResult.recordset[0];

    if (user) {
      res.status(401).json({ error: 'User already exists' });
    } else {
      await pool
        .request()
        .input('username', sql.VarChar, username)
        .input('hashedpassword', sql.VarChar, hashedPassword)
        .input('email', sql.VarChar, email)
        .query(
          'INSERT INTO users (username, hashedpassword, email) VALUES (@username, @hashedpassword, @email)'
        );

      res.status(201).json({ message: 'User created successfully' });
    }
  } catch (error) {
    res.status(500).json(error.message);
  } finally {
    if (pool) {
      pool.close(); // Release the connection pool
    }
  }
};

export const login = async (req, res) => {
  let pool;
  try {
    const { username, password } = req.body;
    pool = await sql.connect(config.sql);

    const userResult = await pool
      .request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM users WHERE username = @username');

    const user = userResult.recordset[0];

    if (!user) {
      res
        .status(401)
        .json({ error: 'Authentication failed. User not found.' });
    } else {
      console.log(user); // Check user object

      const passwordMatch = await bcrypt.compare(password, user.hashedpassword);

      console.log(password); // Check password value

      if (!passwordMatch) {
        res.status(401).json({ error: 'Authentication failed. Wrong password' });
      } else {
        const token = jwt.sign(
          { email: user.email, username: user.username, id: user.user_id },
          process.env.JWT_SECRET
        );

        const { user_id, username, email } = user;

        res.json({ id: user_id, username, email, token });
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  } finally {
    if (pool) {
      pool.close(); // Release the connection pool
    }
  }
};
