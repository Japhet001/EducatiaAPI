import sql from "mssql";
// import { config } from '../db/config.js';
import config from '../db/config.js';


const pool = new sql.ConnectionPool(config.sql);
await pool.connect();

// Getting all courses
export const getAllCourses = async (req, res) => {
  try {
    let pool = await sql.connect(config.sql);
    const courses = await pool.request().query("SELECT * FROM Course");
    res.status(200).json(courses.recordset);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while retrieving courses" });
  } finally {
    sql.close();
  }
};

// Creating a course
// Creating a course
export const createCourse = async (req, res) => {
  try {
    const { course_name, instructor_id, description, syllabus, course_id} = req.body;
    const courses = await pool.request()
      .input("course_name", sql.VarChar, course_name)
      .input("instructor_id", sql.Int, instructor_id)
      .input("description", sql.VarChar, description)
      .input("syllabus", sql.VarChar, syllabus)
      .input("course_id", sql.Int , course_id)
      .query("INSERT INTO Course (course_name, instructor_id, description, syllabus, course_id) VALUES (@course_name, @instructor_id, @description, @syllabus, @course_id)");
    res.status(200).json({ message: "New course added successfully" });
  } catch (error) {
    res.status(400).json(error.message);
  } finally {
    sql.close();
  }
};


// Updating a course
export const updateCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { course_name, instructor_id, description, syllabus } = req.body;
    let pool = await sql.connect(config.sql);
    await pool
      .request()
      .input("course_id", sql.Int, course_id)
      .input("course_name", sql.VarChar, course_name)
      .input("instructor_id", sql.Int, instructor_id)
      .input("description", sql.VarChar, description)
      .input("syllabus", sql.VarChar, syllabus)
      .query("UPDATE Course SET course_name = @course_name, instructor_id = @instructor_id, description = @description, syllabus = @syllabus WHERE course_id = @course_id");
    res.status(200).json({ message: "Course details updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the course" });
  } finally {
    sql.close();
  }
};

// Deleting a course
export const deleteCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    await sql.connect(config.sql);
    await sql.query`DELETE FROM Course WHERE course_id = ${course_id}`;
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while deleting the course" });
  } finally {
    sql.close();
  }
};

// Getting a single course
export const getCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    let pool = await sql.connect(config.sql);
    const result = await pool
      .request()
      .input("course_id", sql.Int, course_id)
      .query("SELECT * FROM Course WHERE course_id = @course_id");
    !result.recordset[0]
    ? res.status(404).json({ message: "Course not found" })
    : res.status(200).json(result.recordset);
} catch (error) {
  res.status(500).json({ error: "An error occurred while retrieving the course" });
} finally {
  sql.close();
}
};
