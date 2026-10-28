import institutionRoutes from './institutionRoutes.js';
import studentRoutes from './studentRoutes.js';
import siteRoutes from './siteRoutes.js';
import lecturerRoutes from './lecturerRoutes.js';
import facultyRoutes from './facultyRoutes.js';
import courseRoutes from './courseRoutes.js';
import moduleRoutes from './moduleRoutes.js';
import userRoutes from './userRoutes.js';
import { Router } from "express";
import initializeRoutes from "./initializeRoutes.js";
import authRoutes from "./authRoutes.js";
import supportRoutes from "./supportRoutes.js";
import academicYearRoutes from "./academicYearRoutes.js";
import calendarEventRoutes from "./calendarEventRoutes.js";
import timetableRoutes from "./timetableRoutes.js";
import enrollmentRoutes from "./enrollmentRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";

const indexRoutes = Router();

indexRoutes.use('/institutions', institutionRoutes);
indexRoutes.use('/students', studentRoutes);
indexRoutes.use('/sites', siteRoutes);
indexRoutes.use('/lecturers', lecturerRoutes);
indexRoutes.use('/faculties', facultyRoutes);
indexRoutes.use('/courses', courseRoutes);
indexRoutes.use('/modules', moduleRoutes);
indexRoutes.use("/users", userRoutes);
indexRoutes.use("/support", supportRoutes);
indexRoutes.use("/academic-years", academicYearRoutes);
indexRoutes.use("/calendar-events", calendarEventRoutes);
indexRoutes.use("/timetable-slots", timetableRoutes);
indexRoutes.use("/enrollments", enrollmentRoutes);
indexRoutes.use("/attendance", attendanceRoutes);
indexRoutes.use("/initialize", initializeRoutes);
indexRoutes.use("/auth", authRoutes);

export default indexRoutes;
