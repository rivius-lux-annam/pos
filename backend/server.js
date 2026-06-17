import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// Schema lưu từng món trong order
const orderItemSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    category: String,
    price: Number,
    quantity: Number,
    note: String,
    image: String,
  },
  { _id: false }
);

// Schema lưu order
const orderSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderType: {
      type: String,
      default: "Tại quầy",
    },
    customerName: {
      type: String,
      default: "Khách lẻ",
    },
    status: {
      type: String,
      enum: ["new", "preparing", "completed", "cancelled"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// API kiểm tra backend
app.get("/", (req, res) => {
  res.send("POS Backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is working",
    mongoState: mongoose.connection.readyState,
  });
});

app.get("/api/test-db", (req, res) => {
  res.json({
    success: true,
    message: "MongoDB test",
    dbState: mongoose.connection.readyState,
  });
});

// Menu mẫu
const menuItems = [
  {
    id: 1,
    name: "Bạc xỉu",
    category: "Cà phê",
    price: 35000,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400",
  },
  {
    id: 2,
    name: "Cà phê sữa",
    category: "Cà phê",
    price: 30000,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
  },
  {
    id: 3,
    name: "Trà đào cam sả",
    category: "Trà",
    price: 45000,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
  },
  {
    id: 4,
    name: "Matcha Latte",
    category: "Đá xay",
    price: 50000,
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400",
  },
];

app.get("/api/menu", (req, res) => {
  res.json({
    success: true,
    data: menuItems,
  });
});

// Tạo order mới
app.post("/api/orders", async (req, res) => {
  try {
    const { items, totalAmount, orderType, customerName } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order phải có ít nhất 1 món",
      });
    }

    const orderId = Date.now();

    const calculatedTotal = items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);

    const newOrder = await Order.create({
      id: orderId,
      code: `ORD-${orderId}`,
      items,
      totalAmount: totalAmount || calculatedTotal,
      orderType: orderType || "Tại quầy",
      customerName: customerName || "Khách lẻ",
      status: "new",
    });

    res.status(201).json({
      success: true,
      message: "Tạo order thành công",
      data: newOrder,
    });
  } catch (error) {
    console.error("Lỗi tạo order:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Lấy danh sách order
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách order:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Cập nhật trạng thái order
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const orderParam = req.params.id;
    const { status } = req.body;

    if (!["new", "preparing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái order không hợp lệ",
      });
    }

    let order = null;

    // Trường hợp frontend gửi _id của MongoDB
    if (mongoose.Types.ObjectId.isValid(orderParam)) {
      order = await Order.findByIdAndUpdate(
        orderParam,
        { status },
        { new: true }
      );
    }

    // Trường hợp frontend gửi id dạng số
    if (!order && !Number.isNaN(Number(orderParam))) {
      order = await Order.findOneAndUpdate(
        { id: Number(orderParam) },
        { status },
        { new: true }
      );
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy order",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái order thành công",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái order:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});