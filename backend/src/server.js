const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { success } = require("./utils/apiResponse");
const redisClient = require("./config/redis");

const app = express();
app.use(cors());
app.use(express.json());

const mountApiVersions = (basePath, routes) => {
  app.use(`${basePath}/auth`, routes.authRoutes);
  app.use(`${basePath}/departments`, routes.departmentRoutes);
  app.use(`${basePath}/employees`, routes.employeeRoutes);
  app.use(`${basePath}/attendance`, routes.attendanceRoutes);
  app.use(`${basePath}/leaves`, routes.leaveRoutes);
  app.use(`${basePath}/payroll`, routes.payrollRoutes);
  app.use(`${basePath}/recruitment`, routes.recruitmentRoutes);
  app.use(`${basePath}/performance`, routes.performanceRoutes);
  app.use(`${basePath}/notifications`, routes.notificationRoutes);
  app.use(`${basePath}/analytics`, routes.analyticsRoutes);
  app.use(`${basePath}/audit`, routes.auditRoutes);
  app.use(`${basePath}/files`, routes.fileRoutes);
  app.use(`${basePath}/email`, routes.emailRoutes);
  app.use(`${basePath}/uploads`, routes.uploadRoutes);
};

app.get("/", (req, res) => {
  success(res, {
    message: "AI HRMS Backend Running"
  });
});

app.get("/health", async (req, res) => {
  let redisStatus = "DOWN";

  try {
    if (typeof redisClient.ping === "function") {
      await redisClient.ping();
      redisStatus = "UP";
    }
  } catch (err) {
    redisStatus = "DOWN";
  }

  success(res, {
    server: "UP",
    database: "UP",
    redis: redisStatus
  });
});
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

const authRoutes = require("./routes/authRoutes");
const departmentRoutes =
require("./routes/departmentRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes =
require("./routes/attendanceRoutes");
const leaveRoutes =
require("./routes/leaveRoutes");
const payrollRoutes =
require("./routes/payrollRoutes");
const recruitmentRoutes =
require("./routes/recruitmentRoutes");
const performanceRoutes =
require("./routes/performanceRoutes");
const notificationRoutes =
require("./routes/notificationRoutes");
const analyticsRoutes =
require("./routes/analyticsRoutes");
const auditRoutes =
require("./routes/auditRoutes");
const fileRoutes = require("./routes/fileRoutes");
const emailRoutes = require("./routes/emailRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const legacyRoutes = {
  authRoutes,
  departmentRoutes,
  employeeRoutes,
  attendanceRoutes,
  leaveRoutes,
  payrollRoutes,
  recruitmentRoutes,
  performanceRoutes,
  notificationRoutes,
  analyticsRoutes,
  auditRoutes,
  fileRoutes,
  emailRoutes,
  uploadRoutes
};

mountApiVersions("/api", legacyRoutes);
mountApiVersions("/api/v1", legacyRoutes);

require("./workers/emailWorker");

const swaggerUi =
require("swagger-ui-express");

const swaggerSpec =
require("./config/swagger");

app.use(
 "/api-docs",

 swaggerUi.serve,

 swaggerUi.setup(
  swaggerSpec
 )

);

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
