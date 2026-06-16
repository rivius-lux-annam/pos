import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import KitchenScreen from "./components/KitchenScreen";

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [screen, setScreen] = useState("pos");

  useEffect(() => {
    axios
      .get("/api/menu")
      .then((res) => {
        setMenuItems(res.data.data);
      })
      .catch((err) => {
        console.error("Lỗi lấy menu:", err);
      });
  }, []);

  const addToCart = (item) => {
    const existedItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existedItem) {
      const newCart = cart.map((cartItem) => {
        if (cartItem.id === item.id) {
          return {
            ...cartItem,
            quantity: cartItem.quantity + 1,
          };
        }

        return cartItem;
      });

      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          ...item,
          quantity: 1,
          note: "",
        },
      ]);
    }
  };

  const increaseQuantity = (id) => {
    const newCart = cart.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }

      return item;
    });

    setCart(newCart);
  };

  const decreaseQuantity = (id) => {
    const newCart = cart
      .map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(newCart);
  };

  const updateNote = (id, note) => {
    const newCart = cart.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          note,
        };
      }

      return item;
    });

    setCart(newCart);
  };

  const totalAmount = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const submitOrder = () => {
    if (cart.length === 0) {
      alert("Vui lòng chọn món trước khi xác nhận order");
      return;
    }

    const orderData = {
      items: cart,
      totalAmount,
      orderType: "Tại quầy",
      customerName: "Khách lẻ",
    };

    axios
      .post("/api/orders", orderData)
      .then((res) => {
        alert("Tạo order thành công!");
        console.log("Order mới:", res.data.data);
        setCart([]);
      })
      .catch((err) => {
        console.error("Lỗi tạo order:", err);
        alert("Không tạo được order");
      });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Self Order POS App</h1>
          <p>Menu bán hàng, tạo order và màn hình Bar/Bếp</p>
        </div>
      </header>

      <nav className="screen-tabs">
        <button
          className={screen === "pos" ? "active" : ""}
          onClick={() => setScreen("pos")}
        >
          Bán hàng
        </button>

        <button
          className={screen === "kitchen" ? "active" : ""}
          onClick={() => setScreen("kitchen")}
        >
          Bar/Bếp
        </button>
      </nav>

      {screen === "pos" && (
        <main className="pos-layout">
          <section className="menu-section">
            <h2>Menu</h2>

            <div className="menu-grid">
              {menuItems.map((item) => (
                <div className="menu-card" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="menu-card-content">
                    <p className="category">{item.category}</p>
                    <h3>{item.name}</h3>
                    <p className="price">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>

                    <button onClick={() => addToCart(item)}>Thêm món</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="cart-section">
            <h2>Order hiện tại</h2>

            {cart.length === 0 ? (
              <p className="empty-cart">Chưa có món nào.</p>
            ) : (
              <>
                <div className="cart-list">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-top">
                        <div>
                          <h3>{item.name}</h3>
                          <p>{item.price.toLocaleString("vi-VN")}đ</p>
                        </div>

                        <div className="quantity-control">
                          <button onClick={() => decreaseQuantity(item.id)}>
                            -
                          </button>

                          <span>{item.quantity}</span>

                          <button onClick={() => increaseQuantity(item.id)}>
                            +
                          </button>
                        </div>
                      </div>

                      <input
                        value={item.note}
                        onChange={(e) => updateNote(item.id, e.target.value)}
                        placeholder="Ghi chú: ít đá, không đường, mang đi..."
                      />
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Tổng tiền</span>
                  <strong>{totalAmount.toLocaleString("vi-VN")}đ</strong>
                </div>

                <button className="checkout-button" onClick={submitOrder}>
                  Xác nhận order
                </button>
              </>
            )}
          </aside>
        </main>
      )}

      {screen === "kitchen" && <KitchenScreen />}
    </div>
  );
}

export default App;