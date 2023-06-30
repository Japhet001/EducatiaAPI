import { login, register, loginRequired } from '../controllers/userController.js';
import { getAllCourses, createCourse, updateCourse, deleteCourse, getCourse } from '../controllers/courseController.js';

const routes = (app) => {


    // auth routes

    app.route('/auth/register')
        .post(register);

    app.route('/auth/login')
        .post(login);

    // course routes
    app.route('/courses')
        .get(getAllCourses)
        .post(createCourse);

    app.route('/courses/:course_id')
        .put(loginRequired, updateCourse)
        .delete(loginRequired, deleteCourse)
        .get(getCourse);
};

export default routes;


    
  