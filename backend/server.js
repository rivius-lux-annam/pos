import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("POS Backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is working"
  });
});

const menuItems = [
  {
    id: 1,
    name: "Bạc xỉu",
    category: "Cà phê",
    price: 35000,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400"
  },
  {
    id: 2,
    name: "Cà phê sữa",
    category: "Cà phê",
    price: 30000,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400"
  },
  {
    id: 3,
    name: "Trà đào cam sả",
    category: "Trà",
    price: 45000,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"
  },
  {
    id: 4,
    name: "Matcha Latte",
    category: "Đá xay",
    price: 50000,
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400"
  }
];

let orders = [];

app.post("/api/orders", (req, res) => {
  const { items, totalAmount, orderType, customerName } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order phải có ít nhất 1 món"
    });
  }

  const newOrder = {
    id: Date.now(),
    code: `ORD-${Date.now()}`,
    items,
    totalAmount,
    orderType: orderType || "Tại quầy",
    customerName: customerName || "Khách lẻ",
    status: "new",
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);

  res.status(201).json({
    success: true,
    message: "Tạo order thành công",
    data: newOrder
  });
});

app.get("/api/orders", (req, res) => {
  res.json({
    success: true,
    data: orders
  });
});

app.patch("/api/orders/:id/status", (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy order"
    });
  }

  order.status = status;

  res.json({
    success: true,
    message: "Cập nhật trạng thái order thành công",
    data: order
  });
});

app.get("/api/menu", (req, res) => {
  res.json({
    success: true,
    data: menuItems
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});