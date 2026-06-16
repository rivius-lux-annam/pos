import { useEffect, useState } from "react";
import axios from "axios";

function KitchenScreen() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    axios
      .get("/api/orders")
      .then((res) => {
        setOrders(res.data.data);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách order:", err);
      });
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = (orderId, status) => {
    axios
      .patch(`/api/orders/${orderId}/status`, { status })
      .then(() => {
        fetchOrders();
      })
      .catch((err) => {
        console.error("Lỗi cập nhật trạng thái:", err);
        alert("Không cập nhật được trạng thái order");
      });
  };

  const getStatusText = (status) => {
    if (status === "new") return "Mới";
    if (status === "preparing") return "Đang làm";
    if (status === "completed") return "Hoàn thành";
    return status;
  };

  const activeOrders = orders.filter((order) => order.status !== "completed");

  return (
    <div className="kitchen-screen">
      <div className="kitchen-header">
        <div>
          <h2>Màn hình Bar/Bếp</h2>
          <p>Danh sách order đang chờ xử lý</p>
        </div>

        <button onClick={fetchOrders}>Làm mới</button>
      </div>

      {activeOrders.length === 0 ? (
        <div className="empty-kitchen">
          Chưa có order mới.
        </div>
      ) : (
        <div className="kitchen-grid">
          {activeOrders.map((order) => (
            <div className="kitchen-card" key={order.id}>
              <div className="kitchen-card-header">
                <div>
                  <h3>{order.code}</h3>
                  <p>{order.customerName}</p>
                </div>

                <span className={`status status-${order.status}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="kitchen-items">
                {order.items.map((item) => (
                  <div className="kitchen-item" key={item.id}>
                    <div>
                      <strong>
                        {item.quantity} x {item.name}
                      </strong>

                      {item.note && (
                        <p>Ghi chú: {item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="kitchen-footer">
                <span>
                  Tổng: {order.totalAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <div className="kitchen-actions">
                {order.status === "new" && (
                  <button
                    className="prepare-button"
                    onClick={() => updateOrderStatus(order.id, "preparing")}
                  >
                    Đang làm
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    className="complete-button"
                    onClick={() => updateOrderStatus(order.id, "completed")}
                  >
                    Hoàn thành
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KitchenScreen;