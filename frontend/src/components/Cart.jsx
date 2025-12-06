import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const {
    cart,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
  } = useCart();

  const navigate = useNavigate();

  const handleGoToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={closeCart}
      ></div>

      
      <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        
        
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-shopping-cart text-2xl"></i>
            <div>
              <h2 className="text-xl font-bold">Mi Carrito</h2>
              <p className="text-sm text-blue-100">
                {getTotalItems()} {getTotalItems() === 1 ? "producto" : "productos"}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-shopping-cart text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-gray-600 mb-6">
              Agregá productos para comenzar tu compra
            </p>
            <button
              onClick={closeCart}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Seguir Comprando
            </button>
          </div>
        ) : (
          <>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-xl p-4 flex gap-4 hover:bg-gray-100 transition"
                >

                  <Link
                    to={`/product/${item.id}`}
                    onClick={closeCart}
                    className="shrink-0"
                  >
                    <img
                      src={item.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23E5E7EB'/%3E%3C/svg%3E"}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>


                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      onClick={closeCart}
                      className="font-semibold text-gray-800 hover:text-blue-600 transition block truncate mb-1"
                    >
                      {item.title}
                    </Link>


                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-lg font-bold text-blue-600">
                        ${item.final_price.toFixed(2)}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-sm text-gray-400 line-through">
                          ${item.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center"
                      >
                        <i className="fa-solid fa-minus text-xs"></i>
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center disabled:opacity-50"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white transition flex items-center justify-center"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
              <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ${getSubtotal().toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  El costo de envío se calcula en el checkout
                </p>
              </div>

              
              <div className="space-y-2">
                
                <button
                  onClick={handleGoToCheckout}
                  className="w-full bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-credit-card"></i>
                  Ir al Checkout
                </button>

               
                <button
                  onClick={closeCart}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
                >
                  Seguir Comprando
                </button>

               
                <button
                  onClick={() => {
                    if (window.confirm("¿Estás seguro de vaciar el carrito?")) {
                      clearCart();
                    }
                  }}
                  className="w-full text-red-600 hover:text-red-700 py-2 text-sm font-semibold transition"
                >
                  <i className="fa-solid fa-trash mr-2"></i>
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </>
        )}
      </div>
   
      
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </>
  );
}