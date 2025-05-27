import express from 'express';
import { isAdmin, isAuth } from '../middlewares/isAuth.js';
import { createCourse,
    addLecture,
    deleteLecture,
    addDocumentation,
    deleteDocumentation,
    deleteCourse,
    getAllStats,
    updateRole,
    getAllUser 
    } from '../controllers/admin.js';
import { uploadFiles } from '../middlewares/multer.js';

const router = express.Router();

router.post('/course/new',isAuth,isAdmin,uploadFiles, createCourse );
// Add lecture
router.post('/course/:id/lecture', isAuth, isAdmin, uploadFiles, addLecture);

// Add documentation
router.post('/course/:id/documentation', isAuth, isAdmin, uploadFiles, addDocumentation);

router.delete('/course/:id',isAuth,isAdmin,deleteCourse);
router.delete("/lecture/:id",isAuth,isAdmin,deleteLecture);
router.delete("/documentation/:id",isAuth,isAdmin,deleteDocumentation);
router.get('/stats', isAuth, isAdmin, getAllStats);
router.put('/user/:id',isAuth,updateRole);
router.get("/users",isAuth,isAdmin, getAllUser)
export default router;