import { Router } from "express";
import * as packageController from "../controllers/package.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import { updatepackage } from "../controllers/package.controller";
import { deletepackage } from "../controllers/package.controller";


const router = Router();

// Menampilkan semua paket (Bisa diakses tanpa login)
router.get("/", packageController.listPackages);
router.get("/:id", packageController.getDetailPackage);
// Proses checkout paket (Wajib login)
router.post("/checkout", authMiddleware, packageController.checkoutPackage);
router.put("/:id", authMiddleware, adminMiddleware, updatepackage)

router.post("/create", authMiddleware,adminMiddleware, packageController.createNewPackage)
router.delete("/:id", authMiddleware, adminMiddleware,deletepackage)
export default router;